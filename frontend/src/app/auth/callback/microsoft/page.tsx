import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Finishing sign in…' };

/**
 * OAuth callback shell. Token exchange lands in Volume 1 Part 2 (Identity).
 */
export default function MicrosoftCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Finishing sign in…</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
