'use client';

import { useState, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ArrowLeft, Camera, Copy, Check,
  Plus, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfile, createCoupleSpace, joinCoupleSpace } from '@/features/auth/actions';
import { uploadFileToStorage } from '@/lib/supabase/storage';

type Intent = 'create' | 'join' | null;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
  }),
};

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIntent = searchParams.get('intent') as Intent;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadFileToStorage(file, 'avatars', 'profiles');
      setAvatarUrl(url);
      await updateProfile({ display_name: displayName.trim(), avatar_url: url });
    } catch {
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const totalSteps = 4;

  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps));
    setError('');
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
    setError('');
  }, []);

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await createCoupleSpace();
      setGeneratedCode(result.code ?? '');
      setIntent('create');
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSpace = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await joinCoupleSpace(inviteCode.trim());
      setConnected(true);
      setIntent('join');
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterSpace = () => {
    router.push('/home');
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-[80vh]">
      {/* Back button */}
      {step > 1 && step < 4 && (
        <button
          onClick={goBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Steps */}
      <div className="flex-1 flex items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">What should we call you?</h2>
                  <p className="text-sm text-muted-foreground">This is how your partner will see you</p>
                </div>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="h-14 rounded-xl bg-card border-border/50 text-center text-lg"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <Button
                  onClick={handleSaveName}
                  disabled={loading || !displayName.trim()}
                  className="w-full h-12 rounded-xl"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
                </Button>
              </div>
            )}

            {/* Step 2: Avatar */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">Add a photo</h2>
                  <p className="text-sm text-muted-foreground">So your partner recognizes you</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-28 h-28 rounded-full bg-card border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group shadow-xs"
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                        {uploadingAvatar ? (
                          <Loader2 className="w-7 h-7 animate-spin" />
                        ) : (
                          <Camera className="w-7 h-7" />
                        )}
                        <span className="text-[10px] mt-1">Upload</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Tap circle to pick from camera or gallery</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={goNext} disabled={uploadingAvatar} className="w-full h-12 rounded-xl">
                    Continue
                  </Button>
                  <button
                    onClick={goNext}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Intent */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-serif mb-2">What brings you here?</h2>
                  <p className="text-sm text-muted-foreground">You can always change this later</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCreateSpace}
                    disabled={loading}
                    className="w-full p-5 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Create our space</h3>
                        <p className="text-sm text-muted-foreground">
                          Start a new couple space and invite your partner
                        </p>
                      </div>
                    </div>
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/30" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background px-3 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <div className="w-full p-5 rounded-xl bg-card border border-border/50">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                        <UserPlus className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Join my partner</h3>
                        <p className="text-sm text-muted-foreground">
                          Enter an invite code to connect
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        placeholder="OURS-XXXXXX"
                        className="h-11 rounded-lg bg-background border-border/50 font-mono text-sm tracking-wider"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoinSpace()}
                      />
                      <Button
                        onClick={handleJoinSpace}
                        disabled={loading || !inviteCode.trim()}
                        className="h-11 rounded-lg px-5"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                      </Button>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>
            )}

            {/* Step 4: Result */}
            {step === 4 && (
              <div className="space-y-8">
                {intent === 'create' && generatedCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-serif mb-2">Your space is ready</h2>
                      <p className="text-sm text-muted-foreground">
                        Share this code with your partner
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50">
                      <p className="text-3xl font-mono font-semibold tracking-[0.2em] mb-4">
                        {generatedCode}
                      </p>
                      <Button
                        onClick={handleCopyCode}
                        variant="outline"
                        className="rounded-lg gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy invite code
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      This code expires in 7 days
                    </p>

                    <Button
                      onClick={handleEnterSpace}
                      className="w-full h-12 rounded-xl"
                    >
                      Enter Our Space
                    </Button>
                  </motion.div>
                )}

                {intent === 'join' && connected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-center space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <h2 className="text-3xl font-serif mb-3">You found each other.</h2>
                      <p className="text-muted-foreground">Your space is waiting</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button
                        onClick={handleEnterSpace}
                        className="w-full h-12 rounded-xl"
                      >
                        Enter Our Space
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i + 1 === step
                ? 'w-6 bg-primary'
                : i + 1 < step
                  ? 'w-1.5 bg-primary/50'
                  : 'w-1.5 bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading onboarding...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
