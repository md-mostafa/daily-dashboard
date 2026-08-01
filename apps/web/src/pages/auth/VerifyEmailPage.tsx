import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { authApi } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            {status === "loading" && <Loader2 className="size-12 animate-spin text-primary" />}
            {status === "success" && (
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="size-8 text-green-500" />
              </div>
            )}
            {status === "error" && (
              <div className="rounded-full bg-destructive/10 p-3">
                <XCircle className="size-8 text-destructive" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Verified!"}
            {status === "error" && "Verification failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <Link to="/login">
              <Button className="mt-2">Sign in</Button>
            </Link>
          )}
          {status === "error" && (
            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="text-foreground hover:underline">
                Back to sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}