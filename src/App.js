import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import React, { useState, useRef, useEffect, handleChange } from 'react';
import Search from './components/Search';


// function to add text aligned to left
function addTextToCanvasL(canvas, text, x, y, size, color) {
  const ctx = canvas.getContext('2d');
  ctx.font = `${size}px LXGWWenKai`;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
}

// function to add text aligned to right
function addTextToCanvasR(canvas, text, x, y, size, color) {
  const ctx = canvas.getContext('2d');
  ctx.font = `${size}px LXGWWenKai`;
  ctx.fillStyle = color;
  ctx.textAlign = 'right';
  ctx.fillText(text, x, y);
}

// convert from seconds to minutes and seconds
function s2ms(s) {
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

function App() {
  const [firstImage, setFirstImage] = useState(null);
  const [secondImage, setSecondImage] = useState(null);
  const [mergedImageURL, setMergedImageURL] = useState('');
  const [posInfo, setPosInfo] = useState({ "anime": "ギヴン", "name": "JR 町田駅南口", "episode": 5, "time": 502, "x": 35.542906, "y": 139.4449 });
  const [p2Para, setP2Para] = useState({ "scale": 1, "x": 0, "y": 0 });
  const [fontLoaded, setFontLoaded] = useState(false);

  const firstCanvasRef = useRef(null);
  const secondCanvasRef = useRef(null);

  // unique filename for download
  const now = new Date();
  const formattedDateTime = now.toISOString().replace(/:\d+\.\d+Z$/, '').replace(/[-T:]/g, '').replace(/\..+/, '');
  const downloadFileName = `MergedImage_${formattedDateTime}.png`;



  const handleChange = (e) => {
    const { name, value } = e.target;
    setPosInfo(prevState => ({
      ...prevState,
      [name]: name === 'episode' || name === 'time' ? parseInt(value, 10) : name === 'x' || name === 'y' ? parseFloat(value) : value
    }));
  };


  const handleImageChange = (event, setImage, canvasRef) => {
    const file = event.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFirstImageChange = (event) => {
    handleImageChange(event, setFirstImage, firstCanvasRef);
  };

  const handleSecondImageChange = (event) => {
    handleImageChange(event, setSecondImage, secondCanvasRef);
  };


  // load font
  useEffect(() => {
    const font = new FontFace('LXGWWenKai', 'url(./LXGWWenKai.ttf)');
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      setFontLoaded(true);
    }).catch(error => { console.log('Font loading error:', error); setFontLoaded(false); });
  }, []);


  useEffect(() => {
    if (!firstImage || !secondImage) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const firstImg = new Image();
    const secondImg = new Image();


    firstImg.onload = () => {
      secondImg.onload = () => {
        // size calculation
        const h = firstImg.height;
        const w = firstImg.width;
        const textMargin = 0.01 * w;
        const textSize = 0.04 * h;

        canvas.width = w;
        canvas.height = 2.15 * h;


        // Draw second images
        // second image scale para
        const scaleWidth = w * p2Para.scale;
        const scaleHeight = w * p2Para.scale * (secondImg.height / secondImg.width);
        ctx.drawImage(secondImg, 0 + p2Para.x * w, h + p2Para.y * h, scaleWidth, scaleHeight);

        // Draw first images
        ctx.drawImage(firstImg, 0, 0);





        // set footer bgc
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 2 * h, canvas.width, 0.15 * h);


        // Add Anime name
        addTextToCanvasL(canvas, "🎞️ " + posInfo.anime, textMargin, 2.04 * h + textMargin, textSize, '#000000');
        addTextToCanvasL(canvas, "⏱️ EP" + posInfo.episode.toString().padStart(2, '0') + " " + s2ms(posInfo.time), textMargin, 2.1 * h + textMargin, textSize, '#000000');
        addTextToCanvasR(canvas, posInfo.name + " 📍", w - textMargin, 2.04 * h + textMargin, textSize, '#000000');
        addTextToCanvasR(canvas, posInfo.x.toString() + "," + posInfo.y.toString() + " 🧭", w * 1.005 - textMargin, 2.1 * h + textMargin, textSize, '#000000');


        // set merged image url
        setMergedImageURL(canvas.toDataURL('image/png'));
      };
      secondImg.src = URL.createObjectURL(secondImage);
    };
    firstImg.src = URL.createObjectURL(firstImage);
  }, [p2Para, posInfo, firstImage, secondImage]);

  return (
    <div className="App">


      <div className="container">
        <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
          <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none">
            <span class="fs-4">I'm Here! 圣地巡礼对比图生成器</span>
          </a>
          {/* <ul class="nav nav-pills">
            <li><button className="btn">About</button></li>
          </ul> */}
        </header>

        <div class="row">
          <Search />

        </div>


        <div className="row mb-3">
          <div className="col-md-5">
            <button
              className={`btn ${!secondImage ? 'btn-outline-primary' : 'btn-outline-secondary disabled'}`}
              onClick={() => document.getElementById('fileInput').click()}
              disabled={secondImage}>
              1.上传截图
            </button>
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              onChange={handleFirstImageChange}
            />
          </div>

          <div className="col-md-5">
            <button
              className={`btn ${firstImage ? 'btn-outline-primary' : 'btn-outline-secondary disabled'}`}
              onClick={() => firstImage && document.getElementById('secondFileInput').click()}
              disabled={!firstImage}>
              2.上传实景
            </button>
            <input
              type="file"
              id="secondFileInput"
              style={{ display: 'none' }}
              onChange={handleSecondImageChange}
              disabled={!firstImage}
            />
          </div>
        </div>
        <div className="row">
          <div>
            {fontLoaded ? (
              <div>
                <p style={{ fontFamily: 'LXGWWenKai' }}>字体已加载.</p>
              </div>
            ) : (
              <div>加载字体中...</div>
            )}
          </div>

        </div>


        <div className="row">
          <div className="col-md-5">
            <canvas ref={firstCanvasRef} style={{ maxWidth: '50%' }} ></canvas>

          </div>
          <div className="col-md-5">
            <canvas ref={secondCanvasRef} style={{ maxWidth: '50%' }}></canvas>
          </div>
        </div>


        <div className="row mt-3">
          <p className="h1">文字</p>
          <div className="col-md-12">
            <label>作品名</label>
            <input
              type="text"
              className="form-control"
              name="anime"
              value={posInfo.anime}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            />

            <label>集数</label>
            <input
              type="number"
              className="form-control"
              name="episode"
              value={posInfo.episode}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            />
            <label>时间</label>
            <input
              type="number"
              className="form-control"
              name="time"
              value={posInfo.time}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            />
            <label>地名</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={posInfo.name}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            />
            <label>经度</label>
            <input
              type="text"
              className="form-control"
              name="x"
              value={posInfo.x}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            />
            <label>纬度</label>
            <input
              type="text"
              className="form-control"
              name="y"
              value={posInfo.y}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
            />
          </div>
        </div>






        <div className="row mt-3">
          <p class="h1">调整实拍图</p>

          <div className="col-md-4 d-flex align-items-center">
            <label htmlFor="scaleRange" className="form-label me-2" onClick={() => setP2Para({ ...p2Para, scale: 1 })}>缩</label>
            <input
              type="range"
              className="form-range"
              id="scaleRange"
              min="0"
              max="2"
              step="0.04"
              value={p2Para.scale}
              onChange={(e) => setP2Para({ ...p2Para, scale: parseFloat(e.target.value) })}
            />
          </div>

          <div className="col-md-4 d-flex align-items-center">
            <label htmlFor="xRange" className="form-label me-2" onClick={() => setP2Para({ ...p2Para, x: 0 })}>X</label>
            <input
              type="range"
              className="form-range"
              id="xRange"
              min="-1"
              max="1"
              step="0.02"
              value={p2Para.x}
              onChange={(e) => setP2Para({ ...p2Para, x: parseFloat(e.target.value) })}
            />
          </div>
          <div className="col-md-4 d-flex align-items-center">
            <label htmlFor="yRange" className="form-label me-2" onClick={() => setP2Para({ ...p2Para, y: 0 })}>Y</label>
            <input
              type="range"
              className="form-range"
              id="yRange"
              min="-1"
              max="1"
              step="0.02"
              value={p2Para.y}
              onChange={(e) => setP2Para({ ...p2Para, y: parseFloat(e.target.value) })}
            />
          </div>
        </div>



        <div className="row mt-3">
          <p class="h1">合并结果</p>

          <div class="col-md-5">
            <a href={mergedImageURL} className="btn btn-outline-primary" download={downloadFileName}>下载</a>
          </div>
        </div>
        <div className="row mt-3">
          {mergedImageURL && (
            <div className="col-md-5">
              <img src={mergedImageURL} id="result" alt="Merged" style={{ maxWidth: '100%' }} />
            </div>
          )}
        </div>

      </div>


      <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
        <div class="col-md-4 d-flex align-items-center">
          <a href="https://github.com/ihkk" class="link" target="_blank" style={{ textDecoration: "none" }}><span class="mb-3 mb-md-0 text-muted">© Jacky HE</span></a>
        </div>

        <ul class="nav col-md-4 justify-content-end list-unstyled d-flex">
          <li class="ms-3">
            <a className="text-muted" target="_blank" href="https://github.com/ihkk/imhere">
              <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" alt="GitHub Logo" style={{ width: '24px', height: '24px' }} />
            </a>


          </li>
        </ul>
      </footer>
    </div>

  );
}

export default App;
