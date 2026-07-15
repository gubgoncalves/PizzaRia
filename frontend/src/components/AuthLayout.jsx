import heroPizzaImg from "../assets/pizza-hero.png";

function AuthLayout() {
  const EmphasisIcon = ({ flip }) => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transform: flip ? "scaleX(-1)" : "none",
        margin: "0 8px",
      }}
    >
      <path
        d="M4 12 L9 12 M5 6 L10 9 M5 18 L10 15"
        stroke="#cc251c"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <>
      <aside className="branding-section">
        <div className="branding-content">
          <div className="pizza-hero">
            <img src={heroPizzaImg} alt="Pizza Hero" className="hero-pizza" />
          </div>

          <div className="hero-text">
            <div className="text-top">
              <EmphasisIcon />
              SUA PIZZA,
              <EmphasisIcon flip />
            </div>

            <div className="text-bottom">
              <span className="white-text">SEU</span>
              <span className="red-text">SORRISO!</span>
            </div>
          </div>

          <p className="hero-description">
            Pizzas deliciosas, feitas com amor
            <br />
            e entregues com rapidez até você.
          </p>

          <div className="features">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-motorcycle feature-icon"></i>
              </div>
              <span>
                Entrega rápida
                <br />e segura
              </span>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-pizza-slice feature-icon"></i>
              </div>
              <span>
                Ingredientes
                <br />
                selecionados
              </span>
            </div>

            <div className="feature-divider"></div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-regular fa-face-smile feature-icon"></i>
              </div>
              <span>
                Clientes
                <br />
                satisfeitos
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AuthLayout;