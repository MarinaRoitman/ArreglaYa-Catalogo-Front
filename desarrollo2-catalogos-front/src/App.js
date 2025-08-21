function App() {
  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
        backgroundColor: "white",
        color: "black",
        padding: "20px"
      }}
    >
      <p style={{ fontSize: "2rem", marginBottom: "20px" }}>
        y aqui pondría mi frontend...
      </p>

      <img
        src="https://preview.redd.it/t5bm1ajbjeq71.jpg?auto=webp&s=cfe53a4e44bbd51ded5776362bcd11e162f9f7cb"
        alt="meme"
        style={{
          maxWidth: "400px",
          width: "60%",
          height: "auto",
          borderRadius: "8px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
        }}
      />

      <p style={{ fontSize: "2.3rem", fontWeight: "bold", marginTop: "20px" }}>
        SI TUVIERA UNO
      </p>
    </div>
  );
}

export default App;
