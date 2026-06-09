import { redirect } from 'next/navigation';

export default function HomePage() {
  // User root URL (/) ekata awoth kelinma login page ekata redirect karanawa
  redirect('/login');
}