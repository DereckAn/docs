import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
}

const Header = ({ children, className }: HeaderProps) => {
  return (
    <div className="header flex">
      <Link href={"/"} className="logo md:flex-1">
        <Image
          src={"/images/pato.webp"}
          alt="logo"
          width={100}
          height={100}
          className="logo-image"
        />
      </Link>
      {children}
    </div>
  );
};

export default Header;
