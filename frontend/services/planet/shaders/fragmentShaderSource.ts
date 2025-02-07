const fragmentShaderSource = /* glsl */`
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform int background;
    uniform int cities;
    uniform float time;
    uniform float left;
    uniform float top;
    uniform vec2 resolution;
    uniform float angle;
    uniform float rotspeed;
    uniform float light;
    uniform float zLight;
    uniform float modValue;
    uniform vec2 noiseOffset;
    uniform vec2 noiseScale;
    uniform vec2 noiseScale2;
    uniform vec2 noiseScale3;
    uniform vec2 cloudNoise;

    uniform float cloudiness;

    uniform float waterLevel;
    uniform float rivers;
    uniform float temperature;

    uniform vec3 ocean;
    uniform vec3 ice;
    uniform vec3 cold;
    uniform vec3 temperate;
    uniform vec3 warm;
    uniform vec3 hot;
    uniform vec3 speckle;
    uniform vec3 clouds;
    uniform vec3 haze;
    uniform vec3 lightColor;

    //
    // GLSL textureless classic 2D noise "cnoise",
    // with an RSL-style periodic variant "pnoise".
    // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
    // Version: 2011-08-22
    //
    // Many thanks to Ian McEwan of Ashima Arts for the
    // ideas for permutation and gradient selection.
    //
    // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
    // Distributed under the MIT license. See LICENSE file.
    // https://github.com/ashima/webgl-noise
    //

    vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / modValue)) * modValue;
    }

    vec4 permute(vec4 x) {
        return mod289(((x*34.0)+1.0)*x);
    }

    vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
    }

    vec2 fade(vec2 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
    }

    // Classic Perlin noise, periodic variant
    float pnoise(vec2 P, vec2 rep) {
        vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
        vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
        Pi = mod(Pi, rep.xyxy); // To create noise with explicit period
        Pi = mod289(Pi);        // To avoid truncation effects in permutation
        vec4 ix = Pi.xzxz;
        vec4 iy = Pi.yyww;
        vec4 fx = Pf.xzxz;
        vec4 fy = Pf.yyww;

        vec4 i = permute(permute(ix) + iy);

        vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
        vec4 gy = abs(gx) - 0.5 ;
        vec4 tx = floor(gx + 0.5);
        gx = gx - tx;

        vec2 g00 = vec2(gx.x,gy.x);
        vec2 g10 = vec2(gx.y,gy.y);
        vec2 g01 = vec2(gx.z,gy.z);
        vec2 g11 = vec2(gx.w,gy.w);

        vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
        g00 *= norm.x;  
        g01 *= norm.y;  
        g10 *= norm.z;  
        g11 *= norm.w;  

        float n00 = dot(g00, vec2(fx.x, fy.x));
        float n10 = dot(g10, vec2(fx.y, fy.y));
        float n01 = dot(g01, vec2(fx.z, fy.z));
        float n11 = dot(g11, vec2(fx.w, fy.w));

        vec2 fade_xy = fade(Pf.xy);
        vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
        float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
        return 2.3 * n_xy;
    }

    float spow(float x, float y) {
        float s = sign(x);
        return s * pow(s * x, y);
    }

    vec4 planet(in vec2 pix) {
        vec2 p = -1.0 + 2.0 * pix;
        p.x *= resolution.x / resolution.y;
        float rot = time * rotspeed;
        p = mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * p;
    
        float rdParam;
        vec3 ro = vec3( 0.0, 0.0, 2.25 );
        if (background == 1) {
            rdParam = -2.0;
        } else {
            rdParam = -2.12;
        }
        vec3 rd = normalize( vec3( p, rdParam ) );

        vec3 col = vec3(0.0);

        // intersect sphere
        float b = dot(ro,rd);
        float c = dot(ro,ro) - 1.0;
        float h = b*b - c;
        float t = -b - sqrt(h);
        vec3 pos = ro + t*rd;
        vec3 nor = pos;

        // texture mapping
        vec2 uv;
        uv.x = atan(nor.x,nor.z)/6.2831 + rot;
        uv.y = acos(nor.y)/3.1416;
        uv.y = 0.5 + spow(uv.y - 0.5, 1.2);
        uv += noiseOffset;
        
        float n2 = pnoise(uv * noiseScale2, noiseScale2) * 0.05;
        float n = pnoise(uv * noiseScale, noiseScale) + n2;
        float n3 = pnoise(uv * noiseScale3, noiseScale3);
        
        float temp = cos(nor.y * 4.0) + n3 * 0.8 + n * 0.5 + temperature;
        
        float oceanity = min(1.0, 1.0 - smoothstep(0.19, 0.2, n - waterLevel) + rivers * (1.0 - smoothstep(0.01, 0.04, mod(temp - uv.x * 35.0 + 0.3, 1.0) + n * n * 0.35))) * smoothstep(-0.9, -0.75, temp);

        float iceity = max(0.0, 1.0 + waterLevel - oceanity - smoothstep(-0.8, -0.6, temp));
        float specklity = max(0.0, step(0.009, n2 * n3) - iceity - oceanity);
        float coldity = max(0.0, 1.0 - iceity - oceanity - specklity - smoothstep(-0.4, 0.0, temp));
        float temperateity = max(0.0, 1.0 - iceity - coldity - oceanity - specklity - smoothstep(0.3, 0.8, temp));
        float warmity = max(0.0, 1.0 - iceity - coldity - temperateity - oceanity - specklity - smoothstep(1.05, 1.3, temp));
        float hottity = max(0.0, 1.0 - oceanity - iceity - coldity - temperateity - warmity - specklity);
        
        col = ocean * oceanity + ice * iceity + cold * coldity + temperate * temperateity + warm * warmity + hot * hottity + speckle * specklity;
        
        col *= (0.7 + abs(temp + n * 0.2) * 0.3);
        col *= 0.92 + step(0.1, mod(n2, 0.4)) * 0.08;
        col *= 1.0 + step(0.39, mod(n + uv.x, 0.4)) * 0.1;
        
        float cloudN = max(0.0, pnoise((uv + vec2(rotspeed * time, 0)) * cloudNoise, cloudNoise) + cloudiness + n2);
        col = col * (1.0 - cloudN) + clouds * cloudN;

        float lighting = max(sin(light) * nor.y * 2.0 + cos(light) * nor.x * 2.0 + nor.z * zLight,0.0);
        col = col * 0.2 + col * lightColor * lighting * 0.8;
        
        if (
            cities == 1 &&
            lighting <= 0.8 &&
            (n > 0.05 && n < 0.2 ||// Next to the water
            mod(uv.x * uv.y + n / 10.0, 1.0) < 0.1)
        )
        {
            col += vec3(1.0, 1.0, 0.7) * (1.0 - smoothstep(0.4, 0.8, lighting)) * (max(0.7, pnoise(uv * vec2(122.0, 122.0), vec2(122.0, 122.0))) - 0.7) * 3.0;
        }

        //return vec4(col, smoothstep(0.0, 8.0 / resolution.x, h));
        //return vec4(clamp(col, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0)) * smoothstep(0.0, 8.0 / resolution.x, h) + haze * smoothstep(0.0, 30.0 / resolution.x, h + 0.1), smoothstep(0.0, 8.0 / resolution.x, h + 0.2));
        float hazeAlpha;
        if (background == 1) {
            hazeAlpha = length(haze) * smoothstep(0.0, 30.0 / resolution.x, h + 0.1);
        } else {
            hazeAlpha = 0.0;
        }
        vec3 haze2 = normalize(haze);
        //vec4 out = vec4(clamp(col, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0)) * smoothstep(0.0, 8.0 / resolution.x, h), smoothstep(0.0, 8.0 / resolution.x, h));
        float solidity = smoothstep(0.0, 8.0 / resolution.x, h);
        // + vec4(haze2, smoothstep(0.0, 30.0 / resolution.x, h + 0.1) * hazeAlpha);
        return solidity * vec4(clamp(col + haze, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0)), 1.0) + (1.0 - solidity) * vec4(haze2, hazeAlpha);
    }

    void main(void) {
        vec3 coord = vec3(gl_FragCoord);
        coord.x += left;
        coord.y += top;

        gl_FragColor = planet(coord.xy / resolution.xy), 1.0;
    }
`;

export default fragmentShaderSource;
