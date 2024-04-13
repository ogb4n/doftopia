"use client";

import React from "react";
import { Button } from "../ui/Button";

interface ProfileButtonProps {
  text: string;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ text }) => {
  return (
    <>
      <a href="/profil">
        <Button className="h-12 w-32 dark:bg-green dark:hover:bg-blue dark:hover:text-black">
          {text}
        </Button>
      </a>
    </>
  );
};

export default ProfileButton;
