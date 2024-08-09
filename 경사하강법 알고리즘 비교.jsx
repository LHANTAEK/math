import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const OptimizationAlgorithmsComparison = () => {
  const [contourData, setContourData] = useState([]);
  const [pathData, setPathData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  // Himmelblau's function
  const f = (x, y) => {
    return (x ** 2 + y - 11) ** 2 + (x + y ** 2 - 7) ** 2;
  };

  const gradient = (x, y) => {
    const dx = 4 * x * (x ** 2 + y - 11) + 2 * (x + y ** 2 - 7);
    const dy = 2 * (x ** 2 + y - 11) + 4 * y * (x + y ** 2 - 7);
    return [dx, dy];
  };

  const gradientDescent = (startX, startY, learningRate, numIterations) => {
    let x = startX;
    let y = startY;
    const path = [[x, y, f(x, y)]];

    for (let i = 0; i < numIterations; i++) {
      const [gx, gy] = gradient(x, y);
      x -= learningRate * gx;
      y -= learningRate * gy;
      path.push([x, y, f(x, y)]);
    }

    return path;
  };

  const sgd = (startX, startY, learningRate, numIterations) => {
    let x = startX;
    let y = startY;
    const path = [[x, y, f(x, y)]];

    for (let i = 0; i < numIterations; i++) {
      const [gx, gy] = gradient(x, y);
      x -= learningRate * (gx + Math.random() * 0.2 - 0.1);
      y -= learningRate * (gy + Math.random() * 0.2 - 0.1);
      path.push([x, y, f(x, y)]);
    }

    return path;
  };

  const adam = (startX, startY, learningRate, numIterations) => {
    let x = startX;
    let y = startY;
    const path = [[x, y, f(x, y)]];
    let m = [0, 0];
    let v = [0, 0];
    const beta1 = 0.9;
    const beta2 = 0.999;
    const epsilon = 1e-8;

    for (let i = 0; i < numIterations; i++) {
      const [gx, gy] = gradient(x, y);
      m[0] = beta1 * m[0] + (1 - beta1) * gx;
      m[1] = beta1 * m[1] + (1 - beta1) * gy;
      v[0] = beta2 * v[0] + (1 - beta2) * gx * gx;
      v[1] = beta2 * v[1] + (1 - beta2) * gy * gy;
      const mHat = [m[0] / (1 - beta1 ** (i + 1)), m[1] / (1 - beta1 ** (i + 1))];
      const vHat = [v[0] / (1 - beta2 ** (i + 1)), v[1] / (1 - beta2 ** (i + 1))];
      x -= learningRate * mHat[0] / (Math.sqrt(vHat[0]) + epsilon);
      y -= learningRate * mHat[1] / (Math.sqrt(vHat[1]) + epsilon);
      path.push([x, y, f(x, y)]);
    }

    return path;
  };

  const momentum = (startX, startY, learningRate, numIterations) => {
    let x = startX;
    let y = startY;
    const path = [[x, y, f(x, y)]];
    let vx = 0;
    let vy = 0;
    const gamma = 0.9;

    for (let i = 0; i < numIterations; i++) {
      const [gx, gy] = gradient(x, y);
      vx = gamma * vx + learningRate * gx;
      vy = gamma * vy + learningRate * gy;
      x -= vx;
      y -= vy;
      path.push([x, y, f(x, y)]);
    }

    return path;
  };

  const miniBatchGD = (startX, startY, learningRate, numIterations, batchSize = 10) => {
    let x = startX;
    let y = startY;
    const path = [[x, y, f(x, y)]];

    for (let i = 0; i < numIterations; i++) {
      let batchGradX = 0;
      let batchGradY = 0;
      for (let j = 0; j < batchSize; j++) {
        const [gx, gy] = gradient(x + Math.random() * 0.2 - 0.1, y + Math.random() * 0.2 - 0.1);
        batchGradX += gx;
        batchGradY += gy;
      }
      x -= learningRate * batchGradX / batchSize;
      y -= learningRate * batchGradY / batchSize;
      path.push([x, y, f(x, y)]);
    }

    return path;
  };

  useEffect(() => {
    // 등고선 데이터 생성
    const contourData = [];
    for (let x = -5; x <= 5; x += 0.2) {
      for (let y = -5; y <= 5; y += 0.2) {
        contourData.push({ x, y, z: f(x, y) });
      }
    }
    setContourData(contourData);

    // 각 알고리즘의 경로 계산
    const startX = 0, startY = 0, learningRate = 0.01, numIterations = 200;
    setPathData({
      GD: gradientDescent(startX, startY, learningRate, numIterations),
      SGD: sgd(startX, startY, learningRate, numIterations),
      Adam: adam(startX, startY, learningRate, numIterations),
      Momentum: momentum(startX, startY, learningRate, numIterations),
      MiniBatch: miniBatchGD(startX, startY, learningRate, numIterations)
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep < 199 ? prevStep + 1 : 0));
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const colors = {
    GD: "#FF0000",
    SGD: "#00FF00",
    Adam: "#0000FF",
    Momentum: "#FFFF00",
    MiniBatch: "#FF00FF"
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">최적화 알고리즘 비교 (시작점: 0,0)</h2>
      <ScatterChart width={600} height={400} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="x" unit="" domain={[-5, 5]} />
        <YAxis type="number" dataKey="y" name="y" unit="" domain={[-5, 5]} />
        <ZAxis type="number" dataKey="z" name="z" unit="" range={[16, 100]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Legend />
        <Scatter name="등고선" data={contourData} fill="#8884d8" opacity={0.3} />
        {Object.entries(pathData).map(([name, path]) => (
          <Scatter
            key={name}
            name={name}
            data={path.slice(0, currentStep + 1).map(([x, y, z]) => ({ x, y, z }))}
            fill={colors[name]}
            line={{ stroke: colors[name] }}
          />
        ))}
      </ScatterChart>
      <div className="mt-4 text-center">
        <p>스텝: {currentStep}</p>
        {Object.entries(pathData).map(([name, path]) => (
          <p key={name}>
            {name}: ({path[currentStep]?.[0].toFixed(2)}, {path[currentStep]?.[1].toFixed(2)}) - 
            함수값: {path[currentStep]?.[2].toFixed(4)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default OptimizationAlgorithmsComparison;
