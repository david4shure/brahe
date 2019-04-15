const G  = 6.67408e-11;

function meanAnomaly(t, T) {
  return (t / T) * 2 * Math.PI;
}

function newEccAnomaly(M, e) {

  var deltaE=Math.PI;
  var E_low=0.0;
  var E_hi=Math.PI;
  var precision=1.0e-9

  var functionlow;
  var functionmid;

  var iteration = 0

  while (deltaE>precision) {
    var guess=0.5*(E_low+E_hi)

    functionlow = M - E_low + e*Math.sin(E_low)
    functionmid = M - guess + e*Math.sin(guess)

    var test1=functionlow*functionmid

    if (test1<0) {
      E_hi=guess
      deltaE=deltaE/2.0
    } else {
      E_low=guess
      deltaE=deltaE/2.0
    }

    iteration+=1;
  }

  return 0.5*(E_hi+E_low);
}

function eccentricAnomaly(M, e) {
  var eta = 1e-15;
  var Eo;

  if ((-Math.PI < M && M < 0) || (M > Math.PI)) {
    Eo = M - e;
  } else {
    Eo = M + e;
  }

  var E_n = Eo;
  var delta = eta + 1;
  var count = 0;

  while (delta > eta) {
    var E_np1 = E_n + (M - E_n + e * Math.sin(E_n))/(1 - e*Math.cos(E_n));
    delta = Math.abs(E_np1 - E_n);
    E_n = E_np1;
    count = count + 1;

    if (count > 10) {
      console.log("delta", delta, "E_n", E_n, "M", M);
      return
    }
  }

  return E_np1;
}

function trueAnomaly(E, e) {
  return 2 * Math.atan( Math.sqrt( (1 + e) / (1 - e) ) * Math.tan(E / 2));
}

function distance(a, e, E) {
  return a * (1 - e * Math.cos(E));
}

function position(a,e,i,w,omega,mass,t) {
  var u = G * mass;
  var T = 2 * Math.PI * Math.sqrt(Math.pow(a,3) / u);
  var M = meanAnomaly(t%T, T);
  var E = eccentricAnomaly(M, e);

  var theta = trueAnomaly(E, e);
  var r = distance(a,e,E);

  var x = r * Math.cos(theta);
  var y = r * Math.sin(theta)
  var z = 0;

  var coord = [x,y,z];

  var wTrans = [
    [Math.cos(w), -Math.sin(w), 0],
    [Math.sin(w), Math.cos(w), 0],
    [0,0,1]
  ];

  var iTrans = [
    [1,0,0],
    [0, Math.cos(i), -Math.sin(i)],
    [0, Math.sin(i), Math.cos(i)],
  ];

  var omegaTrans = [
    [Math.cos(omega), -Math.sin(omega), 0],
    [Math.sin(omega), Math.cos(omega), 0],
    [0,0,1]
  ];

  coord = linTransform(wTrans, coord);
  coord = linTransform(iTrans, coord);
  coord = linTransform(omegaTrans, coord);

  return coord;
}

function linTransform(matrix, coordinate) {
    if (matrix.length != coordinate.length) {
      return
    }

    new_x = matrix[0][0] * coordinate[0] + matrix[0][1] * coordinate[1] + matrix[0][2] * coordinate[2]
    new_y = matrix[1][0] * coordinate[0] + matrix[1][1] * coordinate[1] + matrix[1][2] * coordinate[2]
    new_z = matrix[2][0] * coordinate[0] + matrix[2][1] * coordinate[1] + matrix[2][2] * coordinate[2]

    return [new_x, new_y, new_z]
}

function parameterizeOrbit(a,e,i,w,omega,mass,numPoints) {
  var u = G * mass;
  var T = 2 * Math.PI * Math.sqrt(Math.pow(a,3) / u);

  var clock = 0;

  var increment = T / numPoints; // numPoints points in the orbit

  var positions = [];

  while (clock <= T) {
    positions.push(position(a,e,i,w,omega,mass,clock));
    clock += increment;
  }

  return positions;
}
