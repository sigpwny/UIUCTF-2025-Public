export const App = ({ children: slot }: any) => {
  return (
    <html>
      <head>
        <title>Ruler of the Universe</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body class="bg-black">{slot}</body>
    </html>
  );
};
