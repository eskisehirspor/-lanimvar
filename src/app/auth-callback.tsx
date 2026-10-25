import { Redirect } from 'expo-router';

/** OAuth returns here; the session is exchanged by the sign-in call, so just go home. */
export default function AuthCallback() {
  return <Redirect href="/" />;
}
