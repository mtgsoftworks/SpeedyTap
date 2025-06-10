import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="pulse-circle"></div>
        </div>
        <h1 className="splash-title">SpeedyTap</h1>
        <p className="splash-subtitle">Her Dokunuş Önemli</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 