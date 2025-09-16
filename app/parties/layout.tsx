import Nav from "@/components/ui/Nav";

const PartiesLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Nav />
      {children}
    </>
  );
};

export default PartiesLayout;
