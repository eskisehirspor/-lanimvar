import { LabScreen } from '@/features/lab/components/LabScreen';
import {
  AcceptanceDemo,
  ArrivalDemo,
  CompletionDemo,
  EmergencyDemo,
  PinRevealDemo,
  PinVerifiedDemo,
  ProofDemo,
  PublishDemo,
  PulseDemo,
  SafetySheetDemo,
  WrongPinDemo,
} from '@/features/lab/motion/demos';

export default function MotionLab() {
  return (
    <LabScreen index="03" title="Hareket" intro="Her geçiş tek başına oynatılır. Hızı ¼×’e alıp inceleyin; “Hareketi azalt” açıkken her şey kısa bir geçişe iner.">
      <PublishDemo />
      <PulseDemo />
      <AcceptanceDemo />
      <ArrivalDemo />
      <PinRevealDemo />
      <WrongPinDemo />
      <PinVerifiedDemo />
      <ProofDemo />
      <CompletionDemo />
      <SafetySheetDemo />
      <EmergencyDemo />
    </LabScreen>
  );
}
