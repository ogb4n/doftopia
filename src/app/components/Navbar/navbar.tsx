import NavbarLinks from "./NavbarLinks";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { buttonVariants } from "../ui/Button";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import SignOutButton from "./SignOutButton";
import ProfileButton from "./ProfileButton";
import Image from "next/image";
import { prisma } from "../../../../lib/prisma";

interface NavbarProps {
  pageName: string;
}

const Navbar = async ({ pageName }: NavbarProps) => {
  const session = await getServerSession({ ...authOptions });
  if (!session) {
    return (
      <nav className="bg-[#796f5a] shadow-xl border-green border-b dark:bg-dark-1 w-full p-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="w-[12rem] grid grid-cols-2">
            <a href="/">
              <Image
                src="/logo_notext.png"
                alt="logo"
                height={96}
                width={96}
                className="absolute top-0 left-0"
              />
            </a>
            <NavbarLinks />
          </div>
          <div className="flex items-center space-x-4">
            <Link
              className={`${buttonVariants()} bg-[#ec8e02] hover:bg-[#b86d00] h-12 w-32`}
              href="/sign-in"
            >
              Sign in
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    );
  }
  const user = await prisma.user.findUnique({
    where: { username: session.user.username },
  });
  if (!user) {
    return;
  }

  return (
    <nav className="bg-[#796f5a] shadow-xl border-green border-b dark:bg-dark-1 w-full p-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="w-[12rem] grid grid-cols-2">
          <a href="/">
            <Image
              src="/logo_notext.png"
              alt="logo"
              height={96}
              width={96}
              className="absolute top-0 left-0"
            />
          </a>
          <NavbarLinks />
        </div>

        <div className="flex items-center space-x-4">
          <p></p>
          {session?.user ? (
            pageName === "profil" ? (
              <SignOutButton />
            ) : (
              <ProfileButton text={`${user.username}`} />
            )
          ) : null}
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
