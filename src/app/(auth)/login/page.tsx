import LoginForm from "@/components/forms/login-forms";
import { Form } from "@/components/ui/form";
import React from "react";

type Props = {};

export default function LoginPage({}: Props) {
  return (
    <div className="h-screen w-full  flex justify-center items-center">
      <LoginForm />
    </div>
  );
}
