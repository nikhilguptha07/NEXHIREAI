import { redirect } from 'next/navigation';

interface ResetPasswordProps {
  searchParams: { token?: string };
}

export default function ResetPasswordAliasPage({ searchParams }: ResetPasswordProps) {
  const token = searchParams.token;
  if (token) {
    redirect(`/auth/reset-password?token=${encodeURIComponent(token)}`);
  } else {
    redirect('/auth/reset-password');
  }
}
