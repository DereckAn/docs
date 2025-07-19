import Link from "next/link";

const Header = () => {
  return (
    <div className="header">
      <Link href={"/"} className="logo">
        <h1>Next.js</h1>
      </Link>
    </div>
  );
};

export default Header;
