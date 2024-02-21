import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function s2ms(s) {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

function Search({ updatePosInfo }) {
    const [keyword, setKeyword] = useState('');
    const [animeName, setAnimeName] = useState('');
    const [animeNameCn, setAnimeNameCn] = useState('');
    const [results, setResults] = useState([]);
    const [points, setPoints] = useState([]);
    const [showPoints, setShowPoints] = useState(true);
    const [noResult, setNoResult] = useState(false);

    const timerId = useRef(null);

    const handleChange = (event) => {
        setKeyword(event.target.value);
    };

    const search = async () => {
        if (!keyword.trim()) return;
        setNoResult(false);
        try {
            const response = await axios.get(`https://api.bgm.tv/search/subject/${keyword}?type=2`);
            setResults(response.data.list);
            setShowPoints(true);
        } catch (error) {
            console.error('搜索失败:', error);
            setNoResult(true);
        }
    };

    useEffect(() => {
        if (timerId.current) clearTimeout(timerId.current);
        timerId.current = setTimeout(() => {
            search();
        }, 500); // 500ms delay

        return () => clearTimeout(timerId.current);
    }, [keyword]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            clearTimeout(timerId.current);
            search();
        }
    };


    const handleSelect = async (id) => {
        setResults([]);
        try {
            const response = await axios.get(`https://api.anitabi.cn/bangumi/${id}/points/detail`);
            let updatedPoints = response.data;
            console.log('Points data', updatedPoints);

            if (updatedPoints.length === 0) {
                setNoResult(true);
                setShowPoints(false);
            }

            // change pos[0] to x, pos[1] to y
            updatedPoints = updatedPoints.map(point => ({
                ...point,
                x: point.geo[0],
                y: point.geo[1],
                s: point.s || 0,
                ep: point.ep || 0
            }));

            setPoints(updatedPoints);

        } catch (error) {
            console.error('Failed:', error);
            setNoResult(true);
            setShowPoints(false);
        }


    };

    const handleSelectScreenshot = async (pointId) => {
        const selectedPoint = points.find(point => point.id === pointId);
        const { id, cn, ...restOfPoint } = selectedPoint;
        const updatedPoint = { ...restOfPoint, anime: animeName, anime_cn: animeNameCn };
        updatePosInfo(updatedPoint);
        setShowPoints(false);
    };


    return (
        <div className="Search container my-3">
            <div className="row mb-2">
                <div className='col'>
                    <input
                        type="text"
                        className="form-control"
                        value={keyword}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="输入作品名以检索数据库"
                    /></div>
            </div>
            <div>{noResult && (<p>无结果。</p>)}</div>

            <div className="row">
                <div className="col">
                    {results.length > 0 && (
                        <div className="list-group">
                            {results.map((item) => (
                                <div key={item.id} className="list-group-item list-group-item-action d-flex gap-3 py-2 align-items-center" aria-current="true">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center text-decoration-none">
                                        {item.images != null ? (<img src={item.images.common} alt={item.name} className="d-flex align-self-center me-3" style={{ width: '64px' }} />) : <p>　　　　　</p>}
                                        <div>
                                            <h6 className="mb-0">{item.name_cn || item.name}</h6>
                                            <p className="mb-0 opacity-75">{item.name}</p>
                                            <p className="mb-0 opacity-75">{item.id}</p>
                                        </div>
                                    </a>
                                    <div className="ms-auto">
                                        <button type="button" className="btn btn-outline-primary" onClick={(e) => { e.stopPropagation(); setAnimeName(item.name); setAnimeNameCn(item.name_cn); handleSelect(item.id); }}>选择</button> {/* 修改后的按钮 */}
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </div>
            <div className="row mt-2">
                <div className="col">
                    {!showPoints && (
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setShowPoints(true)}
                        >
                            展开巡礼点
                        </button>
                    )}

                    {points.length > 0 && showPoints && (
                        <div className="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
                            {points.map((point) => (
                                <div key={point.id} className="col">
                                    <div className="card">
                                        {point.image && (<img src={point.image} className="card-img-top" alt={point.cn || point.name} />)}
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-8">
                                                    <h6 className="card-title ">{point.cn || point.name}</h6>
                                                    <div className="card-text">
                                                        {point.s > 0 && (
                                                            <span>EP{point.ep} {s2ms(point.s)} </span>
                                                        )}
                                                        {point.originURL ? (
                                                            <a href={point.originURL} target="_blank" rel="noopener noreferrer">来源</a>) : "用户上传"}
                                                    </div>
                                                </div>

                                                <div className="col-4 d-flex align-items-center justify-content-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary p-2 p-sm-2 p-md-1 p-lg-1 p-xl-2"
                                                        onClick={() => handleSelectScreenshot(point.id)}
                                                    >
                                                        使用
                                                    </button>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Search;
