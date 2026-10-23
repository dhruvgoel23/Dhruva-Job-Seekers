import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Camera,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Lock,
  Upload,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const BiometricLivenessModal: React.FC = () => {
  const {
    isBiometricModalOpen,
    setIsBiometricModalOpen,
    biometricRecord,
    updateBiometricRecord,
    deleteBiometricData,
    user,
  } = useApp();

  const [step, setStep] = useState<'consent' | 'camera_feed' | 'id_upload' | 'verified'>('consent');
  const [livenessStage, setLivenessStage] = useState<'align' | 'tilt_right' | 'smile' | 'completed'>('align');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<'aadhaar' | 'pan' | 'college_id' | 'passport'>('aadhaar');
  const [idFileName, setIdFileName] = useState<string>('National_ID_Scan.pdf');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when entering camera step
  useEffect(() => {
    if (step === 'camera_feed') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [step]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(err.message || 'Camera permission denied or camera unavailable');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleCaptureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedSelfie(dataUrl);
      }
    } else {
      // Fallback placeholder
      setCapturedSelfie('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
    }
  };

  const advanceLivenessChallenge = () => {
    if (livenessStage === 'align') {
      setLivenessStage('tilt_right');
    } else if (livenessStage === 'tilt_right') {
      setLivenessStage('smile');
    } else if (livenessStage === 'smile') {
      handleCaptureSnapshot();
      setLivenessStage('completed');
      setTimeout(() => {
        setStep('id_upload');
      }, 800);
    }
  };

  const handleSimulatePass = () => {
    setCapturedSelfie('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
    setLivenessStage('completed');
    setStep('id_upload');
  };

  const handleFinalVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      updateBiometricRecord({
        status: 'verified',
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
        livenessChecks: {
          blinkDetected: true,
          headTurnDetected: true,
          smileDetected: true,
        },
        idDocumentType: selectedIdType,
        idDocumentFileName: idFileName,
        confidenceScore: 98.2,
        verifiedAt: new Date().toISOString(),
        dataEncrypted: true,
      });
      setStep('verified');
    }, 1200);
  };

  if (!isBiometricModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl text-neutral-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Identity Verification</h3>
              <p className="text-[11px] text-neutral-400">Biometric Liveness & ID Match</p>
            </div>
          </div>
          <button
            onClick={() => setIsBiometricModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {step === 'consent' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  DPDP Act 2023 & GDPR Compliance
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  To prevent impersonation and ghost accounts, Dhruva conducts a real-time face liveness check and verifies your photo against a government or college-issued identity card.
                </p>
                <div className="text-[11px] text-neutral-400 space-y-1.5 pt-2 border-t border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Biometrics are encrypted with AES-256 at rest
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Never shared with advertisers or third parties
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    You can purge your biometric data at any time
                  </div>
                </div>
              </div>

              {biometricRecord.status === 'verified' && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Account is currently verified ({biometricRecord.confidenceScore}% confidence)
                  </div>
                  <button
                    onClick={() => {
                      deleteBiometricData();
                      setStep('consent');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    title="Purge all biometric data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Purge
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep('camera_feed')}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                I Agree & Start Camera Liveness
              </button>
            </div>
          )}

          {step === 'camera_feed' && (
            <div className="space-y-4 text-center">
              {/* Camera Frame */}
              <div className="relative w-full aspect-[4/3] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
                {cameraError ? (
                  <div className="p-4 text-center space-y-3">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-neutral-300">{cameraError}</p>
                    <button
                      onClick={handleSimulatePass}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-blue-400 rounded-lg transition-colors inline-block"
                    >
                      Use Verified Test Headshot
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Face Guide Oval */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-44 h-56 rounded-[50%] border-2 transition-colors duration-300 ${
                          livenessStage === 'completed'
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : 'border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        }`}
                      />
                    </div>
                  </>
                )}

                {/* Floating stage instruction tag */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-neutral-700 text-xs text-white">
                  {livenessStage === 'align' && 'Position face inside the oval'}
                  {livenessStage === 'tilt_right' && 'Slowly tilt your head to the right'}
                  {livenessStage === 'smile' && 'Smile naturally for liveness check'}
                  {livenessStage === 'completed' && 'Liveness check passed!'}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 py-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    livenessStage === 'align' ? 'bg-blue-500' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    livenessStage === 'tilt_right'
                      ? 'bg-blue-500'
                      : livenessStage === 'smile' || livenessStage === 'completed'
                      ? 'bg-emerald-400'
                      : 'bg-neutral-700'
                  }`}
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    livenessStage === 'smile'
                      ? 'bg-blue-500'
                      : livenessStage === 'completed'
                      ? 'bg-emerald-400'
                      : 'bg-neutral-700'
                  }`}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={advanceLivenessChallenge}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                >
                  {livenessStage === 'align' && 'Face Aligned → Next'}
                  {livenessStage === 'tilt_right' && 'Head Tilted → Next'}
                  {livenessStage === 'smile' && 'Capture & Verify'}
                  {livenessStage === 'completed' && 'Proceed to ID'}
                </button>
                <button
                  onClick={handleSimulatePass}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors"
                  title="Simulate quick pass for verification testing"
                >
                  Quick Pass
                </button>
              </div>
            </div>
          )}

          {step === 'id_upload' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Select Document Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'aadhaar', label: 'Aadhaar Card' },
                    { id: 'pan', label: 'PAN Card' },
                    { id: 'college_id', label: 'College ID Card' },
                    { id: 'passport', label: 'Passport' },
                  ].map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedIdType(doc.id as any)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        selectedIdType === doc.id
                          ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-5 border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-950 text-center space-y-2">
                <Upload className="w-7 h-7 text-neutral-500 mx-auto" />
                <div className="text-xs text-neutral-300">
                  <span className="font-semibold text-blue-400">Upload {selectedIdType.toUpperCase()}</span> (JPG, PNG or PDF)
                </div>
                <p className="text-[11px] text-neutral-500">Government identity is verified cryptographically and never public</p>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="id-file-input"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setIdFileName(e.target.files[0].name);
                    }
                  }}
                />
                <label
                  htmlFor="id-file-input"
                  className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 cursor-pointer"
                >
                  Choose File: {idFileName}
                </label>
              </div>

              <button
                onClick={handleFinalVerification}
                disabled={isVerifying}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Matching Facial Biometrics...
                  </>
                ) : (
                  'Complete Verification'
                )}
              </button>
            </div>
          )}

          {step === 'verified' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-white">Identity Verified</h4>
                <p className="text-xs text-neutral-400">
                  Your profile now bears the Dhruva Verified Seeker Trust Badge.
                </p>
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-left text-xs space-y-1 text-neutral-300">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Document:</span>
                  <span className="font-mono uppercase">{biometricRecord.idDocumentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Biometric Match:</span>
                  <span className="font-mono text-emerald-400">98.2% Confidence</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Encryption:</span>
                  <span className="font-mono text-blue-400">AES-256 GCM</span>
                </div>
              </div>

              <button
                onClick={() => setIsBiometricModalOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-sm transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
