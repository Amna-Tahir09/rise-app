"use client";

export default function LandingPage() {
  return (
    <>
      <div className="wrap">
        <nav>
          <div className="logo"><div className="mark"></div> Rise</div>
          <ul>
            <li><a href="#modes">Modes</a></li>
            <li><a href="#journey">How it works</a></li>
          </ul>
          <a className="nav-cta" href="/login">Get started</a>
        </nav>
      </div>

      <section className="hero">
        <div className="doodle doodle-blob doodle-blob-1"></div>

        <div className="wrap">
          {/* doodle: thin vine, top-left, like the portfolio's corner vine */}
          <svg className="doodle doodle-vine" width="70" height="200" viewBox="0 0 70 200" fill="none" stroke="#4B6E6D" strokeWidth="1.4">
            <path d="M20 195 Q40 140 32 90 Q28 55 45 30 Q52 20 48 6"/>
            <circle cx="46" cy="8" r="6"/>
            <circle cx="18" cy="55" r="5.5"/>
            <path d="M32 90 Q10 82 2 60" fill="none"/>
          </svg>

          {/* doodle: sparkles */}
          <svg className="doodle doodle-sparkle-1" width="26" height="26" viewBox="0 0 26 26" fill="#B5A07A">
            <path d="M13 0 L15 11 L26 13 L15 15 L13 26 L11 15 L0 13 L11 11 Z"/>
          </svg>
          <svg className="doodle doodle-sparkle-2" width="18" height="18" viewBox="0 0 18 18" fill="#E0674F">
            <path d="M9 0 L10.5 7.5 L18 9 L10.5 10.5 L9 18 L7.5 10.5 L0 9 L7.5 7.5 Z"/>
          </svg>

          {/* doodle: sticky-note style callout */}
          <div className="doodle-note">
            grounded in your own words, always
          </div>

          <div className="hero-panel">
            <div className="hero-badge">Rise</div>
            <span className="hero-kicker">A coach for your habits and your heart</span>
            <h1>Track your days.<br/>Tend to your <span className="em">nafs</span>.</h1>
            <p className="sub">Rise logs what you do and how you&apos;re doing, then reflects it back through an AI coach that only speaks from your own history and real classical texts — never guesses, never fabricates.</p>
            <a className="hero-cta" href="/signup">Get started →</a>
          </div>
        </div>
      </section>

      <section className="story-line">
        <p>This isn&apos;t another tracker that forgets you the moment you close the tab. <span className="accent">It remembers on purpose.</span></p>
      </section>

      <section className="modes" id="modes">
        <div className="wrap">
          <div className="modes-head">
            <span className="eyebrow">Two ways to grow</span>
            <h2>Pick a mode. Rise meets you where you are.</h2>
          </div>
          <div className="mode-grid">
            <div className="mode-card habit">
              <div className="mode-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c0 4-4 4-4 8a4 4 0 008 0c0-4-4-4-4-8z"/><path d="M12 22v-9"/></svg>
              </div>
              <h3>Habit mode</h3>
              <p>Log your prayers, workouts, and daily routines. Rise notices patterns you&apos;d never spot yourself — like every missed Wednesday.</p>
            </div>
            <div className="mode-card tazkiya">
              <div className="mode-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              </div>
              <h3>Tazkiya mode</h3>
              <p>Reflect on pride, envy, anger, and the rest of the nafs. Rise tracks your reflections and grounds guidance in classical sources.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-outer">
        <div className="wrap">
          <div className="journey" id="journey">
            <span className="eyebrow">How Rise works</span>
            <h2>Three honest steps, no guesswork in between.</h2>
            <div className="journey-steps">
              <div className="jstep">
                <div className="jnum">01</div>
                <div><h3>You log it</h3><p>A habit, a mood, a moment of reflection — whatever&apos;s true today, in your own words.</p></div>
              </div>
              <div className="jstep">
                <div className="jnum">02</div>
                <div><h3>Rise remembers</h3><p>Every entry is stored by meaning, so Rise can find what&apos;s actually relevant, not just recent.</p></div>
              </div>
              <div className="jstep">
                <div className="jnum">03</div>
                <div><h3>You get a grounded answer</h3><p>Rise answers using only what you&apos;ve shared and what it can source — and says so plainly when it can&apos;t.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grounded" id="grounded">
        <svg className="doodle doodle-sparkle-3" width="20" height="20" viewBox="0 0 20 20" fill="#4B6E6D">
          <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z"/>
        </svg>
        <div className="wrap">
          <div className="grounded-card">
            <div>
              <span className="eyebrow">No fabricated wisdom</span>
              <h2>Real sources. Real logs. No invented answers.</h2>
              <p className="desc">In Tazkiya mode especially, Rise never invents a scholarly quote or a source it doesn&apos;t have. If the information isn&apos;t there, it says so plainly instead of making something up.</p>
            </div>
            <div className="quote-card">
              <p>&quot;Looking at your logs, you&apos;ve skipped the gym on three of the last four Wednesdays, and each time your note mentioned being tired from work. Your Monday and Friday attendance is at a hundred percent.&quot;</p>
              <p className="cite">— Rise, answering from your own history</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap cta-wrap">
        <svg className="doodle doodle-vine-2" width="90" height="120" viewBox="0 0 90 120" fill="none" stroke="#F2F6F0" strokeWidth="1.4">
          <path d="M10 115 Q40 80 30 45 Q26 20 50 4"/>
          <circle cx="50" cy="6" r="6"/>
          <circle cx="24" cy="55" r="5"/>
        </svg>
        <div className="cta-band">
          <h2>Start where you are. <span className="em">Rise meets you there.</span></h2>
          <p>Free to start. Private by default.</p>
          <a className="cta-btn" href="/signup">Create your account</a>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div>
              <div className="logo"><div className="mark"></div> Rise</div>
              <p className="tag">Habit and tazkiya coaching, grounded in your own history and real classical sources.</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>Rise — built for people who want to grow, honestly.</span>
            <span>Made with care, one log at a time.</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        :root{
          --cream:#D7DDBC; --cream2:#F1ECE1; --sage-deep:#B3C08C; --ink:#2C3E40; --muted:#5E7473;
          --cedar:#4B6E6D; --cedar-light:#5C8A78; --gold:#D6C6A8; --gold-dark:#B5A07A;
          --terra:#E0674F; --line:rgba(30,42,50,0.1);
        }
        *{box-sizing:border-box; margin:0; padding:0;}
        body{font-family:'Inter',sans-serif; background:var(--cream); color:var(--ink); line-height:1.65; overflow-x:hidden;}
        h1,h2,h3{font-family:'Playfair Display',serif; line-height:1.15;}
        a{color:inherit;}
        .wrap{max-width:1450px; margin:0 auto; padding:0 32px; position:relative;}

        nav{display:flex; align-items:center; justify-content:space-between; padding:34px 0; position:relative; z-index:5;}
        .logo{display:flex; align-items:center; gap:10px; font-family:'Playfair Display'; font-style:italic; font-weight:600; font-size:23px;}
        .logo .mark{width:34px; height:34px; border-radius:50%; overflow:hidden; background:var(--cedar); flex-shrink:0;}
        nav ul{display:flex; gap:34px; list-style:none; font-size:14px; font-weight:500; margin-left:auto; margin-right:48px;}
        nav ul a{text-decoration:none; opacity:0.65;}
        .nav-cta{background:var(--ink); color:var(--cream); padding:11px 24px; border-radius:999px; font-size:13.5px; font-weight:600; text-decoration:none;}

        .hero{position:relative; padding:20px 0 100px; overflow:visible;}
        .doodle{position:absolute; pointer-events:none; z-index:6;}
        .doodle-blob{border-radius:50%;}
        .hero .doodle-blob-1{width:220px; height:220px; background:var(--gold); opacity:0.16; top:-40px; left:-90px; z-index:0;}
        .hero .doodle-blob-2{width:170px; height:170px; background:var(--terra); opacity:0.13; bottom:-50px; right:-60px; z-index:0;}
        .hero .doodle-vine{top:70px; left:-6px; opacity:0.55; z-index:1;}
        .hero .doodle-sparkle-1{top:44px; right:14%; opacity:0.6; z-index:1;}
        .hero .doodle-sparkle-2{top:130px; left:6%; opacity:0.4; z-index:1;}
        .hero .doodle-note{
          position:absolute; top:16px; right:4%; z-index:3;
          background:#FBF0C8; color:#4A5548;
          padding:20px 22px; transform:rotate(4deg);
          box-shadow:0 6px 14px rgba(0,0,0,0.12);
          font-family:'Caveat',cursive; font-size:17px; line-height:1.35; font-weight:600;
          max-width:170px;
          clip-path: polygon(2.0% 0.0%, 11.6% 2.4%, 21.2% -1.8%, 30.8% 2.8%, 40.4% -1.4%, 50.0% 3.2%, 59.6% -1.0%, 69.2% 3.6%, 78.8% -0.6%, 88.4% 4.0%, 98.0% 2.0%, 100.2% 11.6%, 95.8% 21.2%, 100.2% 30.8%, 95.8% 40.4%, 100.2% 50.0%, 95.8% 59.6%, 100.2% 69.2%, 95.8% 78.8%, 100.2% 88.4%, 98.0% 98.0%, 88.4% 100.2%, 78.8% 95.8%, 69.2% 100.2%, 59.6% 95.8%, 50.0% 100.2%, 40.4% 95.8%, 30.8% 100.2%, 21.2% 95.8%, 11.6% 100.2%, 2.0% 98.0%, 4.2% 88.2%, -0.2% 78.4%, 4.2% 68.6%, -0.2% 58.8%, 4.2% 49.0%, -0.2% 39.2%, 4.2% 29.4%, -0.2% 19.6%, 4.2% 9.8%);
        }
        .hero-panel{
          position:relative;
          border-radius:32px;
          padding:56px 44px 60px 180px;
          min-height:420px;
          display:flex;
          flex-direction:column;
          justify-content:center;
          background-image:
            linear-gradient(160deg, rgba(30,42,50,0.55) 0%, rgba(30,42,50,0.35) 55%, rgba(30,42,50,0.6) 100%),
            url('/rise-landing-bg.png');
          background-size:cover;
          background-position:center;
          overflow:hidden;
          color:white;
          z-index:2;
        }
        .hero-badge{
          position:absolute; top:28px; left:168px;
          width:96px; height:96px;
          background:rgba(232,184,75,0.95);
          display:flex; align-items:center; justify-content:center;
          font-family:'Playfair Display'; font-style:italic; font-weight:700; font-size:17px; color:var(--ink);
          letter-spacing:0.02em;
          clip-path: polygon(50.0% 0.0%, 55.5% 8.4%, 62.9% 1.7%, 66.1% 11.2%, 75.0% 6.7%, 75.6% 16.7%, 85.4% 14.6%, 83.3% 24.4%, 93.3% 25.0%, 88.8% 33.9%, 98.3% 37.1%, 91.6% 44.5%, 100.0% 50.0%, 91.6% 55.5%, 98.3% 62.9%, 88.8% 66.1%, 93.3% 75.0%, 83.3% 75.6%, 85.4% 85.4%, 75.6% 83.3%, 75.0% 93.3%, 66.1% 88.8%, 62.9% 98.3%, 55.5% 91.6%, 50.0% 100.0%, 44.5% 91.6%, 37.1% 98.3%, 33.9% 88.8%, 25.0% 93.3%, 24.4% 83.3%, 14.6% 85.4%, 16.7% 75.6%, 6.7% 75.0%, 11.2% 66.1%, 1.7% 62.9%, 8.4% 55.5%, 0.0% 50.0%, 8.4% 44.5%, 1.7% 37.1%, 11.2% 33.9%, 6.7% 25.0%, 16.7% 24.4%, 14.6% 14.6%, 24.4% 16.7%, 25.0% 6.7%, 33.9% 11.2%, 37.1% 1.7%, 44.5% 8.4%);
        }
        .hero-kicker{
          display:inline-block; margin-top:64px;
          background:rgba(31,68,54,0.82); backdrop-filter:blur(3px);
          padding:10px 22px; border-radius:999px; font-size:14px; font-weight:600;
        }
        .hero h1{font-size:38px; font-weight:500; margin:18px 0 18px; max-width:16ch; letter-spacing:-0.01em;}
        .hero h1 .em{font-style:italic; font-weight:600;}
        .hero p.sub{font-size:15px; opacity:0.88; max-width:52ch; margin-bottom:24px;}
        .hero-cta{
          display:inline-flex; align-items:center; gap:8px;
          background:var(--cream); color:var(--ink);
          padding:11px 22px; border-radius:999px; font-weight:700; font-size:14px; text-decoration:none;
        }

        .story-line{padding:80px 0 60px; text-align:center; position:relative;}
        .story-line p{font-family:'Playfair Display'; font-style:italic; font-size:26px; max-width:26ch; margin:0 auto; color:var(--muted); line-height:1.5;}
        .story-line .accent{color:var(--cedar); font-weight:600; font-style:normal;}

        .modes{padding:20px 0 90px;}
        .modes-head{max-width:56ch; margin:0 auto 50px; text-align:center;}
        .modes-head .eyebrow{font-size:12.5px; letter-spacing:0.08em; text-transform:uppercase; color:var(--cedar); font-weight:700; margin-bottom:14px; display:block;}
        .modes-head h2{font-size:32px; font-weight:600;}
        .mode-grid{display:grid; grid-template-columns:1fr 1fr; gap:24px;}
        .mode-card{
          border-radius:28px; padding:40px 36px;
          display:flex; flex-direction:column; gap:16px;
          border:1px solid var(--line);
        }
        .mode-card.habit{background:linear-gradient(160deg, #F1ECE1 0%, #E8E0CE 100%);}
        .mode-card.tazkiya{background:linear-gradient(160deg, #FBF0DC 0%, #F3E0B8 100%);}
        .mode-icon{width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center;}
        .mode-card.habit .mode-icon{background:var(--cedar); color:white;}
        .mode-card.tazkiya .mode-icon{background:var(--gold-dark); color:white;}
        .mode-card h3{font-size:23px; font-weight:600;}
        .mode-card p{font-size:14.5px; color:var(--muted); max-width:34ch;}

        .journey-outer{padding-bottom:90px;}
        .journey{
          background:
            radial-gradient(circle at 15% 10%, rgba(232,184,75,0.18), transparent 45%),
            radial-gradient(circle at 90% 85%, rgba(46,94,78,0.22), transparent 50%),
            linear-gradient(155deg, #4A5D73 0%, #4A5D73 60%, #33445A 100%);
          padding:90px 44px; color:white; border-radius:40px; width:100%;
        }
        .journey .eyebrow{font-size:12.5px; letter-spacing:0.08em; text-transform:uppercase; color:var(--gold); font-weight:700; margin-bottom:16px; display:block;}
        .journey h2{font-size:30px; font-weight:600; max-width:20ch; margin-bottom:56px;}
        .journey-steps{display:flex; flex-direction:column; gap:0;}
        .jstep{display:grid; grid-template-columns:60px 1fr; gap:24px; padding:28px 0; border-top:1px solid rgba(255,255,255,0.15);}
        .jstep:last-child{border-bottom:1px solid rgba(255,255,255,0.15);}
        .jstep .jnum{font-family:'Playfair Display'; font-style:italic; font-size:22px; color:var(--gold); opacity:0.85;}
        .jstep h3{font-size:18px; font-weight:600; margin-bottom:6px; color:white;}
        .jstep p{font-size:14.5px; opacity:0.78; max-width:56ch; color:white;}

        .grounded{padding:90px 0; position:relative;}
        .grounded .doodle-sparkle-3{top:20px; right:8%; opacity:0.5;}
        .grounded-card{
          background:var(--cream2); border-radius:36px; padding:60px;
          display:grid; grid-template-columns:1fr 1fr; gap:50px; align-items:center;
          position:relative; z-index:2;
        }
        .grounded .eyebrow{font-size:12.5px; letter-spacing:0.08em; text-transform:uppercase; color:var(--terra); font-weight:700; margin-bottom:16px; display:block;}
        .grounded h2{font-size:28px; font-weight:600; margin-bottom:14px;}
        .grounded p.desc{font-size:15px; color:var(--muted); max-width:40ch;}
        .quote-card{background:white; border-radius:24px; padding:32px; border:1px solid var(--line);}
        .quote-card p{font-family:'Playfair Display'; font-style:italic; font-size:16px; line-height:1.7; margin-bottom:16px; color:var(--ink);}
        .quote-card .cite{font-size:12.5px; color:var(--muted); font-weight:600;}

        .cta-wrap{padding-bottom:90px; position:relative; max-width:1450px; padding-left:32px; padding-right:32px;}
        .cta-wrap .doodle-vine-2{bottom:-20px; right:-10px; opacity:0.3; z-index:0;}
        .cta-band{
          border-radius:32px; padding:60px; text-align:center;
          min-height:420px;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          background-image:
            linear-gradient(160deg, rgba(30,42,50,0.6), rgba(46,94,78,0.55)),
            url('/rise-landing-bg.png');
          background-size:cover;
          background-position:center;
          color:white; position:relative; z-index:2;
        }
        .cta-band h2{font-size:30px; font-weight:500; margin-bottom:8px;}
        .cta-band h2 .em{font-style:italic; font-weight:600;}
        .cta-band p{font-size:15px; opacity:0.8; margin-bottom:28px;}
        .cta-btn{display:inline-block; background:white; color:var(--ink); padding:11px 24px; border-radius:999px; font-weight:700; font-size:14px; text-decoration:none;}

        footer{border-top:1px solid var(--line); padding:44px 0 28px;}
        .footer-top{display:flex; justify-content:space-between; margin-bottom:36px; flex-wrap:wrap; gap:24px;}
        .footer-top .tag{font-size:13.5px; opacity:0.6; max-width:34ch; margin-top:10px;}
        .footer-bottom{display:flex; justify-content:space-between; font-size:12.5px; opacity:0.5; flex-wrap:wrap; gap:10px;}

        @media (max-width: 860px) {
          .wrap{padding:0 20px;}
          nav ul{display:none;}
          .hero-panel{padding:44px 24px 48px; border-radius:24px;}
          .hero-badge{width:64px; height:64px; top:20px; left:20px; font-size:14px;}
          .hero-kicker{margin-top:44px; font-size:12.5px; padding:8px 16px;}
          .hero h1{font-size:28px; margin:14px 0 14px;}
          .hero p.sub{font-size:14px; margin-bottom:20px;}
          .hero-cta{padding:10px 18px; font-size:13px;}
          .doodle-note{top:8px; right:3%; font-size:12px; padding:10px 12px; max-width:110px;}
          .doodle-vine{width:44px; height:120px; top:40px;}
          .doodle-sparkle-1{width:16px; height:16px;}
          .doodle-sparkle-2{width:12px; height:12px;}
          .story-line p{font-size:19px;}
          .modes-head h2{font-size:24px;}
          .mode-grid{grid-template-columns:1fr 1fr; gap:12px;}
          .mode-card{padding:20px 16px; border-radius:18px;}
          .mode-card h3{font-size:17px;}
          .mode-card p{font-size:12px;}
          .mode-icon{width:34px; height:34px; margin-bottom:10px;}
          .journey{border-radius:24px; padding:56px 24px;}
          .journey-outer{padding-bottom:60px;}
          .journey h2{font-size:22px;}
          .grounded-card{grid-template-columns:1fr; padding:32px; border-radius:24px;}
          .grounded h2{font-size:22px;}
          .cta-band{padding:44px 24px; border-radius:24px;}
          .cta-band h2{font-size:22px;}
          .footer-top{flex-direction:column;}
        }
        @media (max-width: 480px) {
          .hero h1{font-size:24px;}
          .hero-badge{width:52px; height:52px; font-size:12px;}
          .story-line p{font-size:16px;}
        }
      `}</style>
    </>
  );
}