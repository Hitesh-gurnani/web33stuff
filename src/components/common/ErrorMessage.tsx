import React from "react";
import toast from "react-hot-toast";

interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  return <div className="text-red-500">{message}</div>;
}
