
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>
        {`
          .productContent {
            margin-left: 0 !important;
          }
        `}
      </style>

      {children}
    </>
  );
}
