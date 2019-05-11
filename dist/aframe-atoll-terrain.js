!function(e){var n={};function t(o){if(n[o])return n[o].exports;var i=n[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,t),i.l=!0,i.exports}t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var i in e)t.d(o,i,function(n){return e[n]}.bind(null,i));return o},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=3)}([function(e,n){e.exports=function(){for(var e=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],n=0;n<256;n++)e[256+n]=e[n];function t(e){return e*e*e*(e*(6*e-15)+10)}function o(e,n,t){return n+e*(t-n)}function i(e,n,t,o){var i=15&e,r=i<8?n:t,a=i<4?t:12==i||14==i?n:o;return(0==(1&i)?r:-r)+(0==(2&i)?a:-a)}return{noise:function(n,r,a){var l=~~n,s=~~r,u=~~a,c=255&l,d=255&s,f=255&u,m=(n-=l)-1,x=(r-=s)-1,v=(a-=u)-1,p=t(n),y=t(r),g=t(a),h=e[c]+d,E=e[h]+f,b=e[h+1]+f,R=e[c+1]+d,C=e[R]+f,w=e[R+1]+f;return o(g,o(y,o(p,i(e[E],n,r,a),i(e[C],m,r,a)),o(p,i(e[b],n,x,a),i(e[w],m,x,a))),o(y,o(p,i(e[E+1],n,r,v),i(e[C+1],m,r,a-1)),o(p,i(e[b+1],n,x,v),i(e[w+1],m,x,v))))}}}},function(e,n){e.exports="// vertex-color+noise-vert.glsl - vertex shader\n// Copyright © 2019 P. Douglas Reeder under the MIT License\n\nuniform vec3 sunNormal;\nuniform vec3 wavesOffset;\n\nattribute float behavior;\n\nvarying vec3 interpColor;\nvarying vec3 noisePosition;\nvarying float sunFactor;\n\nvoid main() {\n    interpColor = color;\n\n    const vec3 zero = vec3(0.0, 0.0, 0.0);\n    noisePosition = position + ((behavior > 0.0) ? wavesOffset : zero);\n\n    sunFactor = 0.5 + max(dot(normal, sunNormal), 0.0);\n\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n"},function(e,n){e.exports='// vertex-color+noise-frag.glsl - fragment shader\n// Copyright © 2019 P. Douglas Reeder under the MIT License, except as noted\n\nvarying vec3 interpColor;\nvarying vec3 noisePosition;\nvarying float sunFactor;\n\n\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : stegu\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//               https://github.com/stegu/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289(vec2 x) {\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute(vec3 x) {\n    return mod289(((x*34.0)+1.0)*x);\n}\n\nfloat snoise(vec2 v)\n{\n    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n    -0.577350269189626,  // -1.0 + 2.0 * C.x\n    0.024390243902439); // 1.0 / 41.0\n    // First corner\n    vec2 i  = floor(v + dot(v, C.yy) );\n    vec2 x0 = v -   i + dot(i, C.xx);\n\n    // Other corners\n    vec2 i1;\n    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n    //i1.y = 1.0 - i1.x;\n    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n    // x0 = x0 - 0.0 + 0.0 * C.xx ;\n    // x1 = x0 - i1 + 1.0 * C.xx ;\n    // x2 = x0 - 1.0 + 2.0 * C.xx ;\n    vec4 x12 = x0.xyxy + C.xxzz;\n    x12.xy -= i1;\n\n    // Permutations\n    i = mod289(i); // Avoid truncation effects in permutation\n    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n    m = m*m ;\n    m = m*m ;\n\n    // Gradients: 41 points uniformly over a line, mapped onto a diamond.\n    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n    vec3 x = 2.0 * fract(p * C.www) - 1.0;\n    vec3 h = abs(x) - 0.5;\n    vec3 ox = floor(x + 0.5);\n    vec3 a0 = x - ox;\n\n    // Normalise gradients implicitly by scaling m\n    // Approximation of: m *= inversesqrt( a0*a0 + h*h );\n    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n    // Compute final noise value at P\n    vec3 g;\n    g.x  = a0.x  * x0.x  + h.x  * x0.y;\n    g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n    return 130.0 * dot(m, g);\n}\n// end Ashima Arts copyright\n\n\n// by "sam" of "lolengine", apparently Public Domain\nvec3 hsv2rgb(vec3 c)\n{\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n// end "sam" of "lolengine"\n\n\nvoid main() {\n    float noise = snoise(noisePosition.xz) /* + snoise(noisePosition.xz*10.0) */;\n\n    const vec3 factor = vec3(1.0/65.0, 1.0/19.0, 1.0/6.55e4);\n    const vec3 offsetHSV = vec3(0.5, 0.5, 0.5);\n    vec3 noiseHSV = noise * factor + offsetHSV;\n\n    const vec3 offsetRGB = vec3(0.25, 0.5, 0.5);\n    vec3 inherentColor = interpColor + hsv2rgb(noiseHSV) - offsetRGB;\n\n    gl_FragColor = vec4(inherentColor * sunFactor, 1.0);\n}\n'},function(e,n,t){"use strict";t.r(n);var o=t(0),i=t.n(o);AFRAME.registerGeometry("atoll-terrain",{schema:{buffer:{type:"boolean",default:!1},plateauRadius:{type:"number",default:10,min:0},plateauElevation:{type:"number",default:1},middleRadius:{type:"number",default:100,min:10},unitSize:{type:"number",default:1,min:.1,max:1e3},far:{type:"number",default:4e3},landYinColor:{type:"color",default:"#528d04"},landYangColor:{type:"color",default:"#278d53"},seaYinColor:{type:"color"},seaYangColor:{type:"color"},log:{type:"boolean",default:!1}},init:function(e){const n=new i.a,t=100*Math.random(),o=Math.sqrt(3)/2,r=Math.round(e.middleRadius/e.unitSize),a=e.middleRadius/r,l=e.plateauRadius<e.middleRadius-a?e.plateauRadius+a:e.middleRadius-a,s=(r-1)*a+1e-4,u=(r+1)*a+1e-4,c=e.far>u?e.far:u,d=s/4,f=Math.ceil(1.16*r),m=new THREE.Color(e.landYinColor),x=new THREE.Color(e.landYangColor),v=new THREE.Color(e.seaYinColor),p=new THREE.Color(e.seaYangColor);let y=v.clone();y.lerp(p,.5);const g=new THREE.Color(7430491),h=new THREE.Color(8617596);e.log&&console.log("atoll-terrain","PLATEAU_EDGE="+l,"plateauElevation="+e.plateauElevation,"SIZE="+r,"SCAN_SIZE="+f,"UNIT_SIZE="+a,"middleRadius="+e.middleRadius,"FAR="+c);let E=[],b=[],R={};R[-f-1]={};let C=0;for(let i=-f;i<=f;++i){R[i]={};for(let r=-f;r<=f;++r){let f=i*o*a,m=(r-i/2)*a,x=Math.sqrt(f*f+m*m);if(x<=u){let o;if(e.plateauRadius>0&&x<=l)o=e.plateauElevation;else if(x<=s){o=10;for(let i=25;i<=1500;i*=5)o+=n.noise((f+e.middleRadius)/i,(m+e.middleRadius)/i,t)*Math.min(i/2,150);if(e.plateauRadius>0&&(o=e.plateauElevation+(o-e.plateauElevation)*Math.min(x-l,d)/d),(o*=Math.min(s-x,d)/d)>0){let i=5;o+=n.noise((f+e.middleRadius)/i,(m+e.middleRadius)/i,t)*i/2}o<0&&(o=0)}else x<=e.middleRadius?o=0:(f*=c/x,m*=c/x,o=0);R[i][r]=C++,E.push(new THREE.Vector3(f,o,m)),b.push(f,o,m)}}}R[f+1]={};let w=new THREE.Color(4210752);w.lerp(m,.75);const z=5*a,A=25*a,M=3*a,P=12*a;let S=[];let T=new Array(E.length),H=[];for(let o=-f;o<=f;++o)for(let i=-f;i<=f;++i){let r=R[o][i],a=E[r];if(a){let l=R[o][i-1],u=R[o-1][i-1],d=R[o-1][i];if(a.y>0){let s=new Array(6);s[0]=E[l],s[1]=E[u],s[2]=E[d],s[3]=E[R[o][i+1]],s[4]=E[R[o+1][i+1]],s[5]=E[R[o+1][i]];let c=new Array(12);c[0]=E[R[o][i-2]],c[1]=E[R[o-1][i-2]],c[2]=E[R[o-2][i-2]],c[3]=E[R[o-2][i-1]],c[4]=E[R[o-2][i]],c[5]=E[R[o-1][i+1]],c[6]=E[R[o][i+2]],c[7]=E[R[o+1][i+2]],c[8]=E[R[o+2][i+2]],c[9]=E[R[o+2][i+1]],c[10]=E[R[o+2][i]],c[11]=E[R[o+1][i-1]];let f=7*a.y;for(let e=0;e<6;++e)f+=3*s[e].y;for(let e=0;e<12;++e)f+=-2*c[e].y;if(f>70)S.push(h.r,h.g,h.b);else{let o=(1.73205+n.noise((a.x+e.middleRadius)/z,(a.z+e.middleRadius)/z,t)+n.noise((a.x+e.middleRadius)/A,(a.z+e.middleRadius)/A,t))/3.4641,i=m.clone();i.lerp(x,o),S.push(i.r,i.g,i.b)}T[r]=0}else{if(Math.sqrt(a.x*a.x+a.z*a.z)>s)S.push(y.r,y.g,y.b),T[r]=10;else{let e=[];e[0]=E[l],e[1]=E[u],e[2]=E[d],e[3]=E[R[o][i+1]],e[4]=E[R[o+1][i+1]],e[5]=E[R[o+1][i]];let s=0,f=0;for(let n=0;n<6;++n)e[n]&&(e[n].y>0?++s:++f);if(0===s){let e=(1.73205+n.noise((a.x+c)/M,(a.z+c)/M,t)+n.noise((a.x+c)/P,(a.z+c)/P,t))/3.4641,o=v.clone();o.lerp(p,e),S.push(o.r,o.g,o.b),T[r]=10}else if(0===f)S.push(w.r,w.g,w.b),T[r]=0;else{let e=g.clone();e.lerp(m,s/(s+f)),S.push(e.r,e.g,e.b),T[r]=0}}}void 0!==l&&void 0!==u&&H.push(r,l,u),void 0!==u&&void 0!==d&&H.push(r,u,d)}}let F=new THREE.BufferGeometry;F.setIndex(H),F.addAttribute("position",new THREE.Float32BufferAttribute(b,3)),F.computeVertexNormals(),F.addAttribute("color",new THREE.Float32BufferAttribute(S,3)),F.addAttribute("behavior",new THREE.Float32BufferAttribute(T,1)),this.geometry=F}});var r=t(1),a=t.n(r),l=t(2),s=t.n(l);AFRAME.registerShader("vertex-color+noise",{schema:{sunPosition:{type:"vec3",default:{x:-1,y:1,z:-1}},timeMsec:{type:"time",is:"uniform"}},init:function(e){let n=new THREE.Vector3(e.sunPosition.x,e.sunPosition.y,e.sunPosition.z);this.material=new THREE.ShaderMaterial({uniforms:{sunNormal:{value:n.normalize()},wavesOffset:{type:"vec3",value:{x:0,y:0,z:0}}},vertexShader:a.a,fragmentShader:s.a})},update:function(e){if(e.sunPosition){let n=new THREE.Vector3(e.sunPosition.x,e.sunPosition.y,e.sunPosition.z);this.material.uniforms.sunNormal.value=n.normalize()}if(e.timeMsec){let n=e.timeMsec/1e3;this.material.uniforms.wavesOffset.value=new THREE.Vector3(Math.sin(n),0,Math.cos(1.33333*n))}}}),AFRAME.registerPrimitive("a-atoll-terrain",{defaultComponents:{geometry:{primitive:"atoll-terrain",middleRadius:100,unitSize:1,log:!1},material:{shader:"vertex-color+noise",vertexColors:"vertex"}},mappings:{"plateau-radius":"geometry.plateauRadius","plateau-elevation":"geometry.plateauElevation","middle-radius":"geometry.middleRadius","unit-size":"geometry.unitSize",far:"geometry.far",log:"geometry.log",shader:"material.shader","land-yin-color":"geometry.landYinColor","land-yang-color":"geometry.landYangColor","sea-yin-color":"geometry.seaYinColor","sea-yang-color":"geometry.seaYangColor","sun-position":"material.sunPosition",src:"material.src","flat-shading":"material.flatShading"}})}]);
//# sourceMappingURL=aframe-atoll-terrain.js.map