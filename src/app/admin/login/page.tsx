import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login | Black Yellow Barbershop",
  description: "Masuk ke Dashboard Admin Black Yellow Barbershop",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
