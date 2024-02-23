import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import React, { useState, useRef, useEffect } from 'react';
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
  const [posInfo, setPosInfo] = useState({ "anime": "", "anime_cn": "", "name": "", "ep": 0, "s": 0, "x": 0, "y": 0, "image": "" });
  const [p2Para, setP2Para] = useState({ "scale": 1, "x": 0, "y": 0 });
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fetchingPic, setFetchingPic] = useState(false);
  const [needText, setNeedText] = useState(true);
  const [useCNName, setUseCNName] = useState(false);

  const firstCanvasRef = useRef(null);
  const secondCanvasRef = useRef(null);

  // unique filename for download
  const now = new Date();
  const formattedDateTime = now.toISOString().replace(/:\d+\.\d+Z$/, '').replace(/[-T:]/g, '').replace(/\..+/, '');
  const downloadFileName = `MergedImage_${formattedDateTime}.png`;


  const downloadAndDrawImage = async (imageUrl, setFirstImage, canvasRef) => {
    try {
      console.log('fetching image:', imageUrl);
      setFetchingPic(true);
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Network response was not ok.');
      setFetchingPic(false);
      const imageBlob = await response.blob();
      const blobUrl = URL.createObjectURL(imageBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // const imageDataUrl = canvas.toDataURL();
        setFirstImage(imageBlob);
      };
      img.onerror = (e) => {
        console.error('Error loading image:', e);
      };
      img.src = blobUrl;
    } catch (error) {
      console.error('Error fetching or drawing image:', error);
    }
  };



  const updatePosInfo = (point) => {
    setPosInfo(point);
    if (point.image)
      posInfo.image = point.image.replace("?plan=h160", "");
    if (point.image) {
      downloadAndDrawImage(posInfo.image, setFirstImage, firstCanvasRef);
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setPosInfo({ ...posInfo, [name]: value });
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
        // min(h) = 720px
        const h = firstImg.height < 720 ? 720 : firstImg.height;
        const w = firstImg.width * (h / firstImg.height);
        const textMargin = 0.01 * w;
        const textSize = 0.04 * h;

        canvas.width = w;
        if (needText) {
          canvas.height = 2.15 * h;
        } else {
          canvas.height = 2 * h;
        }


        // Draw second images
        // second image scale para
        const scaleWidth = w * p2Para.scale;
        const scaleHeight = w * p2Para.scale * (secondImg.height / secondImg.width);
        ctx.drawImage(secondImg, 0 + p2Para.x * w, h + p2Para.y * h, scaleWidth, scaleHeight);

        // Draw first images
        ctx.drawImage(firstImg, 0, 0, w, h);




        if (needText) {
          // set footer bgc
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 2 * h, canvas.width, 0.15 * h);


          // Add Anime name
          if (!useCNName) {
            addTextToCanvasL(canvas, "🎞️ " + posInfo.anime, textMargin, 2.04 * h + textMargin, textSize, '#000000')
          } else {
            addTextToCanvasL(canvas, "🎞️ " + posInfo.anime_cn, textMargin, 2.04 * h + textMargin, textSize, '#000000')
          }
          if (posInfo.ep > 0) {
            addTextToCanvasL(canvas, "⏱️ EP" + posInfo.ep.toString().padStart(2, '0') + " " + s2ms(posInfo.s), textMargin * 1.15, 2.1 * h + textMargin, textSize, '#000000')
          } else if (posInfo.ep === 0 && posInfo.s > 0) {
            addTextToCanvasL(canvas, "⏱️ " + s2ms(posInfo.s), textMargin * 1.15, 2.1 * h + textMargin, textSize, '#000000')
          }
          addTextToCanvasR(canvas, posInfo.name + " 📍", w - textMargin * 1.3, 2.04 * h + textMargin, textSize, '#000000');
          if (posInfo.x && posInfo.y)
            addTextToCanvasR(canvas, posInfo.x.toString() + "," + posInfo.y.toString() + " 🧭", w - textMargin * 0.7, 2.1 * h + textMargin, textSize, '#000000');

        }
        // set merged image url
        setMergedImageURL(canvas.toDataURL('image/png'));
      };
      secondImg.src = URL.createObjectURL(secondImage);
    };
    firstImg.src = URL.createObjectURL(firstImage);
  }, [p2Para, posInfo, firstImage, secondImage, needText, useCNName]);

  return (
    <div className="App">


      <div className="container">
        <header class="d-flex flex-wrap justify-content-center py-3 border-bottom">
          <a href="." class="d-flex align-items-center me-md-auto text-dark text-decoration-none">
            <span class="fs-4">I'm Here! 圣地巡礼对比图生成器</span>
          </a>
          {/* <ul class="nav nav-pills">
            <li><button className="btn">About</button></li>
          </ul> */}
        </header>

        <div class="row">
          <Search updatePosInfo={updatePosInfo} />

        </div>


        <div className="row mb-3">
          <div className="col-md-5 col-6">
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

          <div className="col-md-5 col-6">
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
          <div className="col-md-5 col-6">
            {fetchingPic && <p>正在加载原图...</p>}
            <canvas ref={firstCanvasRef} style={{ maxWidth: '80%' }} ></canvas>

          </div>
          <div className="col-md-5 col-6">
            <canvas ref={secondCanvasRef} style={{ maxWidth: '80%' }}></canvas>
          </div>
        </div>


        <div className="row mt-3">

          <div className="col-md-12">
            <p className="h1">文本</p>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="textCheckbox"
                checked={needText}
                onChange={(e) => setNeedText(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="textCheckbox">
                需要文本
              </label>
            </div>
            {fontLoaded ? (
              <div>
                <p style={{ fontFamily: 'LXGWWenKai' }}>字体已加载.</p>
              </div>
            ) : (
              <div>加载字体中，首次使用耗时较长...</div>
            )}
            {needText && (
              <div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="textCheckbox"
                    checked={useCNName}
                    onChange={(e) => setUseCNName(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="textCheckbox">
                    使用中文作品名
                  </label>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <label>作品名（中文）</label>
                    <input
                      type="text"
                      className="form-control"
                      name="anime_cn"
                      value={posInfo.anime_cn}
                      onChange={handleChange}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                  <div className="col-md-6">

                    <label>作品名</label>
                    <input
                      type="text"
                      className="form-control"
                      name="anime"
                      value={posInfo.anime}
                      onChange={handleChange}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-6 col-md-6">
                    <label>集数</label>
                    <input
                      type="number"
                      className="form-control"
                      name="ep"
                      value={posInfo.ep}
                      onChange={handleChange}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                  <div className="col-6 col-md-6">

                    <label>时间</label>
                    <input
                      type="number"
                      className="form-control"
                      name="s"
                      value={posInfo.s}
                      onChange={handleChange}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
                <label>地名</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={posInfo.name}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                />
                <div className="row">
                  <div className="col-6 col-md-6">

                    <label>经度</label>
                    <input
                      type="text"
                      className="form-control"
                      name="x"
                      value={posInfo.x}
                      onChange={handleChange}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                  <div className="col-6 col-md-6">

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
              </div>
            )}
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
              min="-0.7"
              max="0.7"
              step="0.01"
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
              min="-0.7"
              max="0.7"
              step="0.01"
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

        <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
          <div class="col-9 d-flex align-items-center">
            <span class="mb-md-0 text-muted">
              ©
              <a href="https://github.com/ihkk" class="link" target="_blank" style={{ textDecoration: "none" }}>Jacky HE</a>,
              data provider <a href="https://anitabi.cn/" class="link" target="_blank" style={{ textDecoration: "none" }}><i class="bi bi-compass"></i> Anitabi</a> & <a href="https://bgm.tv/" class="link" target="_blank" style={{ textDecoration: "none" }}><i class="bi bi-display"></i> Bangumi</a>
            </span>
          </div>

          <ul class="nav col-3 justify-content-end list-unstyled d-flex">
            <li class="ms-3">
              <a className="text-muted" target="_blank" href="https://github.com/anitabi/IMHere">
                <i class="bi bi-github"></i>
              </a>


            </li>
          </ul>
        </footer>

      </div>



    </div>

  );
}

export default App;
