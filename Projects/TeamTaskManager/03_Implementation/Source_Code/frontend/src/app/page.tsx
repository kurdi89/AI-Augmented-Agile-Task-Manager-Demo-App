import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Home Page</h1>
      <nav className="mt-4">
        <ul className="flex space-x-4">
          <li>
            <Link href="/auth/login">Login</Link>
          </li>
          <li>
            <Link href="/auth/signup">Signup</Link>
          </li>
          <li>
            <Link href="/auth/reset-password">Reset Password</Link>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
