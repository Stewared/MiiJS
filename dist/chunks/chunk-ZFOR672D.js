import{$ as ei,$a as Fn,$b as ma,$c as ze,A as Hr,Aa as xt,Ab as Bi,Ac as Sa,Ad as Da,B as Vr,Ba as oa,Bb as Gi,Bc as Ea,Bf as Ha,C as kr,Ca as sa,Cb as Hi,Cc as Bn,Cf as Va,D as Wr,Da as dn,Db as Vi,Dc as xa,Dd as Je,E as zr,Ea as oi,Eb as ki,F as Xr,Fa as yt,Fb as Wi,Fd as Ua,G as Yr,Ga as Dt,H as qr,Ha as Ut,Hd as pn,I as Kr,Ia as si,J as $r,Ja as li,Je as _n,K as Zr,Ka as jt,Ke as Ba,L as Qr,La as la,Le as nr,M as Jr,Ma as ca,Md as wa,N as jr,Na as fa,O as Mn,Oa as da,Oc as Xi,Od as Ia,P as Tn,Pa as At,Pc as Yi,Q as An,Qa as Ht,Qd as Zi,R as ln,Ra as Vt,Rd as hn,S as Rn,Sa as ua,Sd as wt,T as bn,Ta as ci,Td as Qi,U as Cn,Ua as en,Uc as Ma,Ud as Ji,V as Pn,Va as fi,Vd as ut,W as ea,Wc as Ta,Wd as ji,X as ta,Xa as di,Xc as Aa,Xd as Na,Y as na,Ya as In,Yb as pa,Yd as It,Z as Et,Za as Nn,Zb as ha,_ as jn,_a as yn,_b as kt,_c as qi,_d as mn,a as Dr,aa as ti,ab as ui,ac as un,ad as Qe,ae as ya,ba as ni,bb as pi,bc as zi,bd as Gn,be as er,ca as ii,cb as hi,cc as qe,cd as Ra,d as Ur,da as ri,db as mi,dd as ba,de as Hn,e as $n,ea as ai,eb as _i,ed as Ca,f as wr,fb as gi,fh as ar,gb as vi,gd as ft,gg as rr,hb as Si,i as on,ia as Qt,ib as Ei,id as Oe,j as Ir,ja as Gt,jb as xi,jd as Ne,k as Kt,ka as Ln,kb as Mi,kd as nt,kf as ir,l as $t,la as Dn,lb as Ti,m as gt,ma as cn,mb as Ai,n as Tt,na as ia,nb as Ri,nd as Pa,o as Lt,oa as Un,ob as bi,od as dt,oe as Fa,p as sn,pa as ra,pb as Ci,q as Zn,qa as Nt,qb as Pi,qd as Rt,r as Qn,ra as aa,rb as Li,rd as Ki,s as Jn,sb as Di,se as Oa,t as Nr,ta as fn,tb as Ui,td as La,te as tr,u as Zt,ub as wi,uf as Ga,v as yr,va as vt,vb as Ii,vg as ka,w as Fr,wa as wn,wb as Ni,wc as _a,x as Or,xb as yi,xc as ga,y as Br,ya as Jt,yb as Fi,yc as va,yd as Wt,z as Gr,zb as Oi,zc as On,zd as $i}from"./chunk-N5RLJDTW.js";import{g as Lr}from"./chunk-J2TWLMGR.js";Lr();function po(){let e=null,n=!1,t=null,i=null;function l(a,h){t(a,h),i=e.requestAnimationFrame(l)}return{start:function(){n!==!0&&t!==null&&(i=e.requestAnimationFrame(l),n=!0)},stop:function(){e.cancelAnimationFrame(i),n=!1},setAnimationLoop:function(a){t=a},setContext:function(a){e=a}}}function bo(e){let n=new WeakMap;function t(d,b){let x=d.array,w=d.usage,g=x.byteLength,S=e.createBuffer();e.bindBuffer(b,S),e.bufferData(b,x,w),d.onUploadCallback();let R;if(x instanceof Float32Array)R=e.FLOAT;else if(typeof Float16Array<"u"&&x instanceof Float16Array)R=e.HALF_FLOAT;else if(x instanceof Uint16Array)d.isFloat16BufferAttribute?R=e.HALF_FLOAT:R=e.UNSIGNED_SHORT;else if(x instanceof Int16Array)R=e.SHORT;else if(x instanceof Uint32Array)R=e.UNSIGNED_INT;else if(x instanceof Int32Array)R=e.INT;else if(x instanceof Int8Array)R=e.BYTE;else if(x instanceof Uint8Array)R=e.UNSIGNED_BYTE;else if(x instanceof Uint8ClampedArray)R=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+x);return{buffer:S,type:R,bytesPerElement:x.BYTES_PER_ELEMENT,version:d.version,size:g}}function i(d,b,x){let w=b.array,g=b.updateRanges;if(e.bindBuffer(x,d),g.length===0)e.bufferSubData(x,0,w);else{g.sort((R,O)=>R.start-O.start);let S=0;for(let R=1;R<g.length;R++){let O=g[S],U=g[R];U.start<=O.start+O.count+1?O.count=Math.max(O.count,U.start+U.count-O.start):(++S,g[S]=U)}g.length=S+1;for(let R=0,O=g.length;R<O;R++){let U=g[R];e.bufferSubData(x,U.start*w.BYTES_PER_ELEMENT,w,U.start,U.count)}b.clearUpdateRanges()}b.onUploadCallback()}function l(d){return d.isInterleavedBufferAttribute&&(d=d.data),n.get(d)}function a(d){d.isInterleavedBufferAttribute&&(d=d.data);let b=n.get(d);b&&(e.deleteBuffer(b.buffer),n.delete(d))}function h(d,b){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){let w=n.get(d);(!w||w.version<d.version)&&n.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}let x=n.get(d);if(x===void 0)n.set(d,t(d,b));else if(x.version<d.version){if(x.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(x.buffer,d,b),x.version=d.version}}return{get:l,remove:a,update:h}}var Co=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Po=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Lo=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Do=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Uo=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,wo=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Io=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,No=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,yo=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Fo=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Oo=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Bo=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Go=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ho=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Vo=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ko=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Wo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,zo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Xo=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Yo=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,qo=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ko=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,$o=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Zo=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Qo=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Jo=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,jo=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,es=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ts=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ns=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,is="gl_FragColor = linearToOutputTexel( gl_FragColor );",rs=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,as=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,os=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ss=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ls=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,cs=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fs=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ds=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,us=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ps=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,hs=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ms=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,_s=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gs=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,vs=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Ss=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Es=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,xs=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ms=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ts=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,As=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Rs=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,bs=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Cs=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ps=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ls=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ds=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Us=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ws=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Is=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ns=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ys=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Fs=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Os=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bs=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Gs=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hs=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Vs=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ks=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ws=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,zs=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Xs=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ys=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qs=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ks=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,$s=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Zs=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Qs=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Js=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,js=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,el=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,tl=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,nl=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,il=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,rl=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,al=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ol=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,sl=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ll=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,cl=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,fl=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,dl=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ul=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,pl=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,hl=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ml=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,_l=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,gl=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,vl=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Sl=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,El=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,xl=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ml=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Tl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Al=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Rl=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,bl=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Cl=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Pl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ll=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ul=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Il=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Nl=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,yl=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Fl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ol=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bl=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Gl=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Hl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Vl=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kl=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wl=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zl=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Xl=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yl=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ql=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Kl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$l=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ql=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jl=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,jl=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ec=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,tc=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,nc=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ic=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rc=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ac=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Pe={alphahash_fragment:Co,alphahash_pars_fragment:Po,alphamap_fragment:Lo,alphamap_pars_fragment:Do,alphatest_fragment:Uo,alphatest_pars_fragment:wo,aomap_fragment:Io,aomap_pars_fragment:No,batching_pars_vertex:yo,batching_vertex:Fo,begin_vertex:Oo,beginnormal_vertex:Bo,bsdfs:Go,iridescence_fragment:Ho,bumpmap_pars_fragment:Vo,clipping_planes_fragment:ko,clipping_planes_pars_fragment:Wo,clipping_planes_pars_vertex:zo,clipping_planes_vertex:Xo,color_fragment:Yo,color_pars_fragment:qo,color_pars_vertex:Ko,color_vertex:$o,common:Zo,cube_uv_reflection_fragment:Qo,defaultnormal_vertex:Jo,displacementmap_pars_vertex:jo,displacementmap_vertex:es,emissivemap_fragment:ts,emissivemap_pars_fragment:ns,colorspace_fragment:is,colorspace_pars_fragment:rs,envmap_fragment:as,envmap_common_pars_fragment:os,envmap_pars_fragment:ss,envmap_pars_vertex:ls,envmap_physical_pars_fragment:Ss,envmap_vertex:cs,fog_vertex:fs,fog_pars_vertex:ds,fog_fragment:us,fog_pars_fragment:ps,gradientmap_pars_fragment:hs,lightmap_pars_fragment:ms,lights_lambert_fragment:_s,lights_lambert_pars_fragment:gs,lights_pars_begin:vs,lights_toon_fragment:Es,lights_toon_pars_fragment:xs,lights_phong_fragment:Ms,lights_phong_pars_fragment:Ts,lights_physical_fragment:As,lights_physical_pars_fragment:Rs,lights_fragment_begin:bs,lights_fragment_maps:Cs,lights_fragment_end:Ps,logdepthbuf_fragment:Ls,logdepthbuf_pars_fragment:Ds,logdepthbuf_pars_vertex:Us,logdepthbuf_vertex:ws,map_fragment:Is,map_pars_fragment:Ns,map_particle_fragment:ys,map_particle_pars_fragment:Fs,metalnessmap_fragment:Os,metalnessmap_pars_fragment:Bs,morphinstance_vertex:Gs,morphcolor_vertex:Hs,morphnormal_vertex:Vs,morphtarget_pars_vertex:ks,morphtarget_vertex:Ws,normal_fragment_begin:zs,normal_fragment_maps:Xs,normal_pars_fragment:Ys,normal_pars_vertex:qs,normal_vertex:Ks,normalmap_pars_fragment:$s,clearcoat_normal_fragment_begin:Zs,clearcoat_normal_fragment_maps:Qs,clearcoat_pars_fragment:Js,iridescence_pars_fragment:js,opaque_fragment:el,packing:tl,premultiplied_alpha_fragment:nl,project_vertex:il,dithering_fragment:rl,dithering_pars_fragment:al,roughnessmap_fragment:ol,roughnessmap_pars_fragment:sl,shadowmap_pars_fragment:ll,shadowmap_pars_vertex:cl,shadowmap_vertex:fl,shadowmask_pars_fragment:dl,skinbase_vertex:ul,skinning_pars_vertex:pl,skinning_vertex:hl,skinnormal_vertex:ml,specularmap_fragment:_l,specularmap_pars_fragment:gl,tonemapping_fragment:vl,tonemapping_pars_fragment:Sl,transmission_fragment:El,transmission_pars_fragment:xl,uv_pars_fragment:Ml,uv_pars_vertex:Tl,uv_vertex:Al,worldpos_vertex:Rl,background_vert:bl,background_frag:Cl,backgroundCube_vert:Pl,backgroundCube_frag:Ll,cube_vert:Dl,cube_frag:Ul,depth_vert:wl,depth_frag:Il,distance_vert:Nl,distance_frag:yl,equirect_vert:Fl,equirect_frag:Ol,linedashed_vert:Bl,linedashed_frag:Gl,meshbasic_vert:Hl,meshbasic_frag:Vl,meshlambert_vert:kl,meshlambert_frag:Wl,meshmatcap_vert:zl,meshmatcap_frag:Xl,meshnormal_vert:Yl,meshnormal_frag:ql,meshphong_vert:Kl,meshphong_frag:$l,meshphysical_vert:Zl,meshphysical_frag:Ql,meshtoon_vert:Jl,meshtoon_frag:jl,points_vert:ec,points_frag:tc,shadow_vert:nc,shadow_frag:ic,sprite_vert:rc,sprite_frag:ac},ae={common:{diffuse:{value:new Je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ne}},envmap:{envMap:{value:null},envMapRotation:{value:new Ne},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ne},normalScale:{value:new ft(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0},uvTransform:{value:new Ne}},sprite:{diffuse:{value:new Je(16777215)},opacity:{value:1},center:{value:new ft(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ne},alphaMap:{value:null},alphaMapTransform:{value:new Ne},alphaTest:{value:0}}},Ct={basic:{uniforms:ut([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.fog]),vertexShader:Pe.meshbasic_vert,fragmentShader:Pe.meshbasic_frag},lambert:{uniforms:ut([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Je(0)}}]),vertexShader:Pe.meshlambert_vert,fragmentShader:Pe.meshlambert_frag},phong:{uniforms:ut([ae.common,ae.specularmap,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,ae.lights,{emissive:{value:new Je(0)},specular:{value:new Je(1118481)},shininess:{value:30}}]),vertexShader:Pe.meshphong_vert,fragmentShader:Pe.meshphong_frag},standard:{uniforms:ut([ae.common,ae.envmap,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.roughnessmap,ae.metalnessmap,ae.fog,ae.lights,{emissive:{value:new Je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Pe.meshphysical_vert,fragmentShader:Pe.meshphysical_frag},toon:{uniforms:ut([ae.common,ae.aomap,ae.lightmap,ae.emissivemap,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.gradientmap,ae.fog,ae.lights,{emissive:{value:new Je(0)}}]),vertexShader:Pe.meshtoon_vert,fragmentShader:Pe.meshtoon_frag},matcap:{uniforms:ut([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,ae.fog,{matcap:{value:null}}]),vertexShader:Pe.meshmatcap_vert,fragmentShader:Pe.meshmatcap_frag},points:{uniforms:ut([ae.points,ae.fog]),vertexShader:Pe.points_vert,fragmentShader:Pe.points_frag},dashed:{uniforms:ut([ae.common,ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Pe.linedashed_vert,fragmentShader:Pe.linedashed_frag},depth:{uniforms:ut([ae.common,ae.displacementmap]),vertexShader:Pe.depth_vert,fragmentShader:Pe.depth_frag},normal:{uniforms:ut([ae.common,ae.bumpmap,ae.normalmap,ae.displacementmap,{opacity:{value:1}}]),vertexShader:Pe.meshnormal_vert,fragmentShader:Pe.meshnormal_frag},sprite:{uniforms:ut([ae.sprite,ae.fog]),vertexShader:Pe.sprite_vert,fragmentShader:Pe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Pe.background_vert,fragmentShader:Pe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ne}},vertexShader:Pe.backgroundCube_vert,fragmentShader:Pe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Pe.cube_vert,fragmentShader:Pe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Pe.equirect_vert,fragmentShader:Pe.equirect_frag},distance:{uniforms:ut([ae.common,ae.displacementmap,{referencePosition:{value:new Oe},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Pe.distance_vert,fragmentShader:Pe.distance_frag},shadow:{uniforms:ut([ae.lights,ae.fog,{color:{value:new Je(0)},opacity:{value:1}}]),vertexShader:Pe.shadow_vert,fragmentShader:Pe.shadow_frag}};Ct.physical={uniforms:ut([Ct.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ne},clearcoatNormalScale:{value:new ft(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ne},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ne},sheen:{value:0},sheenColor:{value:new Je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ne},transmissionSamplerSize:{value:new ft},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ne},attenuationDistance:{value:0},attenuationColor:{value:new Je(0)},specularColor:{value:new Je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ne},anisotropyVector:{value:new ft},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ne}}]),vertexShader:Pe.meshphysical_vert,fragmentShader:Pe.meshphysical_frag};var Vn={r:0,b:0,g:0},zt=new $i,oc=new Wt;function sc(e,n,t,i,l,a,h){let d=new Je(0),b=a===!0?0:1,x,w,g=null,S=0,R=null;function O(M){let A=M.isScene===!0?M.background:null;return A&&A.isTexture&&(A=(M.backgroundBlurriness>0?t:n).get(A)),A}function U(M){let A=!1,C=O(M);C===null?o(d,b):C&&C.isColor&&(o(C,1),A=!0);let T=e.xr.getEnvironmentBlendMode();T==="additive"?i.buffers.color.setClear(0,0,0,1,h):T==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,h),(e.autoClear||A)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function f(M,A){let C=O(A);C&&(C.isCubeTexture||C.mapping===cn)?(w===void 0&&(w=new wt(new Qi(1,1,1),new It({name:"BackgroundCubeMaterial",uniforms:Ji(Ct.backgroundCube.uniforms),vertexShader:Ct.backgroundCube.vertexShader,fragmentShader:Ct.backgroundCube.fragmentShader,side:gt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),w.geometry.deleteAttribute("normal"),w.geometry.deleteAttribute("uv"),w.onBeforeRender=function(T,N,q){this.matrixWorld.copyPosition(q.matrixWorld)},Object.defineProperty(w.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),l.update(w)),zt.copy(A.backgroundRotation),zt.x*=-1,zt.y*=-1,zt.z*=-1,C.isCubeTexture&&C.isRenderTargetTexture===!1&&(zt.y*=-1,zt.z*=-1),w.material.uniforms.envMap.value=C,w.material.uniforms.flipEnvMap.value=C.isCubeTexture&&C.isRenderTargetTexture===!1?-1:1,w.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,w.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,w.material.uniforms.backgroundRotation.value.setFromMatrix4(oc.makeRotationFromEuler(zt)),w.material.toneMapped=nt.getTransfer(C.colorSpace)!==qe,(g!==C||S!==C.version||R!==e.toneMapping)&&(w.material.needsUpdate=!0,g=C,S=C.version,R=e.toneMapping),w.layers.enableAll(),M.unshift(w,w.geometry,w.material,0,0,null)):C&&C.isTexture&&(x===void 0&&(x=new wt(new ir(2,2),new It({name:"BackgroundMaterial",uniforms:Ji(Ct.background.uniforms),vertexShader:Ct.background.vertexShader,fragmentShader:Ct.background.fragmentShader,side:$t,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),x.geometry.deleteAttribute("normal"),Object.defineProperty(x.material,"map",{get:function(){return this.uniforms.t2D.value}}),l.update(x)),x.material.uniforms.t2D.value=C,x.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,x.material.toneMapped=nt.getTransfer(C.colorSpace)!==qe,C.matrixAutoUpdate===!0&&C.updateMatrix(),x.material.uniforms.uvTransform.value.copy(C.matrix),(g!==C||S!==C.version||R!==e.toneMapping)&&(x.material.needsUpdate=!0,g=C,S=C.version,R=e.toneMapping),x.layers.enableAll(),M.unshift(x,x.geometry,x.material,0,0,null))}function o(M,A){M.getRGB(Vn,ji(e)),i.buffers.color.setClear(Vn.r,Vn.g,Vn.b,A,h)}function P(){w!==void 0&&(w.geometry.dispose(),w.material.dispose(),w=void 0),x!==void 0&&(x.geometry.dispose(),x.material.dispose(),x=void 0)}return{getClearColor:function(){return d},setClearColor:function(M,A=1){d.set(M),b=A,o(d,b)},getClearAlpha:function(){return b},setClearAlpha:function(M){b=M,o(d,b)},render:U,addToRenderList:f,dispose:P}}function lc(e,n){let t=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},l=S(null),a=l,h=!1;function d(p,L,k,G,z){let K=!1,B=g(G,k,L);a!==B&&(a=B,x(a.object)),K=R(p,G,k,z),K&&O(p,G,k,z),z!==null&&n.update(z,e.ELEMENT_ARRAY_BUFFER),(K||h)&&(h=!1,A(p,L,k,G),z!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n.get(z).buffer))}function b(){return e.createVertexArray()}function x(p){return e.bindVertexArray(p)}function w(p){return e.deleteVertexArray(p)}function g(p,L,k){let G=k.wireframe===!0,z=i[p.id];z===void 0&&(z={},i[p.id]=z);let K=z[L.id];K===void 0&&(K={},z[L.id]=K);let B=K[G];return B===void 0&&(B=S(b()),K[G]=B),B}function S(p){let L=[],k=[],G=[];for(let z=0;z<t;z++)L[z]=0,k[z]=0,G[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:k,attributeDivisors:G,object:p,attributes:{},index:null}}function R(p,L,k,G){let z=a.attributes,K=L.attributes,B=0,V=k.getAttributes();for(let J in V)if(V[J].location>=0){let ge=z[J],Ee=K[J];if(Ee===void 0&&(J==="instanceMatrix"&&p.instanceMatrix&&(Ee=p.instanceMatrix),J==="instanceColor"&&p.instanceColor&&(Ee=p.instanceColor)),ge===void 0||ge.attribute!==Ee||Ee&&ge.data!==Ee.data)return!0;B++}return a.attributesNum!==B||a.index!==G}function O(p,L,k,G){let z={},K=L.attributes,B=0,V=k.getAttributes();for(let J in V)if(V[J].location>=0){let ge=K[J];ge===void 0&&(J==="instanceMatrix"&&p.instanceMatrix&&(ge=p.instanceMatrix),J==="instanceColor"&&p.instanceColor&&(ge=p.instanceColor));let Ee={};Ee.attribute=ge,ge&&ge.data&&(Ee.data=ge.data),z[J]=Ee,B++}a.attributes=z,a.attributesNum=B,a.index=G}function U(){let p=a.newAttributes;for(let L=0,k=p.length;L<k;L++)p[L]=0}function f(p){o(p,0)}function o(p,L){let k=a.newAttributes,G=a.enabledAttributes,z=a.attributeDivisors;k[p]=1,G[p]===0&&(e.enableVertexAttribArray(p),G[p]=1),z[p]!==L&&(e.vertexAttribDivisor(p,L),z[p]=L)}function P(){let p=a.newAttributes,L=a.enabledAttributes;for(let k=0,G=L.length;k<G;k++)L[k]!==p[k]&&(e.disableVertexAttribArray(k),L[k]=0)}function M(p,L,k,G,z,K,B){B===!0?e.vertexAttribIPointer(p,L,k,z,K):e.vertexAttribPointer(p,L,k,G,z,K)}function A(p,L,k,G){U();let z=G.attributes,K=k.getAttributes(),B=L.defaultAttributeValues;for(let V in K){let J=K[V];if(J.location>=0){let xe=z[V];if(xe===void 0&&(V==="instanceMatrix"&&p.instanceMatrix&&(xe=p.instanceMatrix),V==="instanceColor"&&p.instanceColor&&(xe=p.instanceColor)),xe!==void 0){let ge=xe.normalized,Ee=xe.itemSize,Be=n.get(xe);if(Be===void 0)continue;let we=Be.buffer,it=Be.type,je=Be.bytesPerElement,W=it===e.INT||it===e.UNSIGNED_INT||xe.gpuType===oi;if(xe.isInterleavedBufferAttribute){let $=xe.data,fe=$.stride,Ce=xe.offset;if($.isInstancedInterleavedBuffer){for(let pe=0;pe<J.locationSize;pe++)o(J.location+pe,$.meshPerAttribute);p.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let pe=0;pe<J.locationSize;pe++)f(J.location+pe);e.bindBuffer(e.ARRAY_BUFFER,we);for(let pe=0;pe<J.locationSize;pe++)M(J.location+pe,Ee/J.locationSize,it,ge,fe*je,(Ce+Ee/J.locationSize*pe)*je,W)}else{if(xe.isInstancedBufferAttribute){for(let $=0;$<J.locationSize;$++)o(J.location+$,xe.meshPerAttribute);p.isInstancedMesh!==!0&&G._maxInstanceCount===void 0&&(G._maxInstanceCount=xe.meshPerAttribute*xe.count)}else for(let $=0;$<J.locationSize;$++)f(J.location+$);e.bindBuffer(e.ARRAY_BUFFER,we);for(let $=0;$<J.locationSize;$++)M(J.location+$,Ee/J.locationSize,it,ge,Ee*je,Ee/J.locationSize*$*je,W)}}else if(B!==void 0){let ge=B[V];if(ge!==void 0)switch(ge.length){case 2:e.vertexAttrib2fv(J.location,ge);break;case 3:e.vertexAttrib3fv(J.location,ge);break;case 4:e.vertexAttrib4fv(J.location,ge);break;default:e.vertexAttrib1fv(J.location,ge)}}}}P()}function C(){q();for(let p in i){let L=i[p];for(let k in L){let G=L[k];for(let z in G)w(G[z].object),delete G[z];delete L[k]}delete i[p]}}function T(p){if(i[p.id]===void 0)return;let L=i[p.id];for(let k in L){let G=L[k];for(let z in G)w(G[z].object),delete G[z];delete L[k]}delete i[p.id]}function N(p){for(let L in i){let k=i[L];if(k[p.id]===void 0)continue;let G=k[p.id];for(let z in G)w(G[z].object),delete G[z];delete k[p.id]}}function q(){c(),h=!0,a!==l&&(a=l,x(a.object))}function c(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:d,reset:q,resetDefaultState:c,dispose:C,releaseStatesOfGeometry:T,releaseStatesOfProgram:N,initAttributes:U,enableAttribute:f,disableUnusedAttributes:P}}function cc(e,n,t){let i;function l(x){i=x}function a(x,w){e.drawArrays(i,x,w),t.update(w,i,1)}function h(x,w,g){g!==0&&(e.drawArraysInstanced(i,x,w,g),t.update(w,i,g))}function d(x,w,g){if(g===0)return;n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,x,0,w,0,g);let R=0;for(let O=0;O<g;O++)R+=w[O];t.update(R,i,1)}function b(x,w,g,S){if(g===0)return;let R=n.get("WEBGL_multi_draw");if(R===null)for(let O=0;O<x.length;O++)h(x[O],w[O],S[O]);else{R.multiDrawArraysInstancedWEBGL(i,x,0,w,0,S,0,g);let O=0;for(let U=0;U<g;U++)O+=w[U]*S[U];t.update(O,i,1)}}this.setMode=l,this.render=a,this.renderInstances=h,this.renderMultiDraw=d,this.renderMultiDrawInstances=b}function fc(e,n,t,i){let l;function a(){if(l!==void 0)return l;if(n.has("EXT_texture_filter_anisotropic")===!0){let N=n.get("EXT_texture_filter_anisotropic");l=e.getParameter(N.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function h(N){return!(N!==At&&i.convert(N)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(N){let q=N===Ut&&(n.has("EXT_color_buffer_half_float")||n.has("EXT_color_buffer_float"));return!(N!==xt&&i.convert(N)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&N!==Dt&&!q)}function b(N){if(N==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";N="mediump"}return N==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let x=t.precision!==void 0?t.precision:"highp",w=b(x);w!==x&&(ze("WebGLRenderer:",x,"not supported, using",w,"instead."),x=w);let g=t.logarithmicDepthBuffer===!0,S=t.reversedDepthBuffer===!0&&n.has("EXT_clip_control"),R=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),O=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),U=e.getParameter(e.MAX_TEXTURE_SIZE),f=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),o=e.getParameter(e.MAX_VERTEX_ATTRIBS),P=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),M=e.getParameter(e.MAX_VARYING_VECTORS),A=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),C=e.getParameter(e.MAX_SAMPLES),T=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:b,textureFormatReadable:h,textureTypeReadable:d,precision:x,logarithmicDepthBuffer:g,reversedDepthBuffer:S,maxTextures:R,maxVertexTextures:O,maxTextureSize:U,maxCubemapSize:f,maxAttributes:o,maxVertexUniforms:P,maxVaryings:M,maxFragmentUniforms:A,maxSamples:C,samples:T}}function dc(e){let n=this,t=null,i=0,l=!1,a=!1,h=new Oa,d=new Ne,b={value:null,needsUpdate:!1};this.uniform=b,this.numPlanes=0,this.numIntersection=0,this.init=function(g,S){let R=g.length!==0||S||i!==0||l;return l=S,i=g.length,R},this.beginShadows=function(){a=!0,w(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(g,S){t=w(g,S,0)},this.setState=function(g,S,R){let O=g.clippingPlanes,U=g.clipIntersection,f=g.clipShadows,o=e.get(g);if(!l||O===null||O.length===0||a&&!f)a?w(null):x();else{let P=a?0:i,M=P*4,A=o.clippingState||null;b.value=A,A=w(O,S,M,R);for(let C=0;C!==M;++C)A[C]=t[C];o.clippingState=A,this.numIntersection=U?this.numPlanes:0,this.numPlanes+=P}};function x(){b.value!==t&&(b.value=t,b.needsUpdate=i>0),n.numPlanes=i,n.numIntersection=0}function w(g,S,R,O){let U=g!==null?g.length:0,f=null;if(U!==0){if(f=b.value,O!==!0||f===null){let o=R+U*4,P=S.matrixWorldInverse;d.getNormalMatrix(P),(f===null||f.length<o)&&(f=new Float32Array(o));for(let M=0,A=R;M!==U;++M,A+=4)h.copy(g[M]).applyMatrix4(P,d),h.normal.toArray(f,A),f[A+3]=h.constant}b.value=f,b.needsUpdate=!0}return n.numPlanes=U,n.numIntersection=0,f}}function uc(e){let n=new WeakMap;function t(h,d){return d===Ln?h.mapping=Qt:d===Dn&&(h.mapping=Gt),h}function i(h){if(h&&h.isTexture){let d=h.mapping;if(d===Ln||d===Dn)if(n.has(h)){let b=n.get(h).texture;return t(b,h.mapping)}else{let b=h.image;if(b&&b.height>0){let x=new er(b.height);return x.fromEquirectangularTexture(e,h),n.set(h,x),h.addEventListener("dispose",l),t(x.texture,h.mapping)}else return null}}return h}function l(h){let d=h.target;d.removeEventListener("dispose",l);let b=n.get(d);b!==void 0&&(n.delete(d),b.dispose())}function a(){n=new WeakMap}return{get:i,dispose:a}}var Ft=4,Wa=[.125,.215,.35,.446,.526,.582],Yt=20,pc=256,gn=new rr,za=new Je,or=null,sr=0,lr=0,cr=!1,hc=new Oe,Wn=class{constructor(n){this._renderer=n,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(n,t=0,i=.1,l=100,a={}){let{size:h=256,position:d=hc}=a;or=this._renderer.getRenderTarget(),sr=this._renderer.getActiveCubeFace(),lr=this._renderer.getActiveMipmapLevel(),cr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(h);let b=this._allocateTargets();return b.depthBuffer=!0,this._sceneToCubeUV(n,i,l,b,d),t>0&&this._blur(b,0,0,t),this._applyPMREM(b),this._cleanup(b),b}fromEquirectangular(n,t=null){return this._fromTexture(n,t)}fromCubemap(n,t=null){return this._fromTexture(n,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qa(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ya(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(n){this._lodMax=Math.floor(Math.log2(n)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let n=0;n<this._lodMeshes.length;n++)this._lodMeshes[n].geometry.dispose()}_cleanup(n){this._renderer.setRenderTarget(or,sr,lr),this._renderer.xr.enabled=cr,n.scissorTest=!1,tn(n,0,0,n.width,n.height)}_fromTexture(n,t){n.mapping===Qt||n.mapping===Gt?this._setSize(n.image.length===0?16:n.image[0].width||n.image[0].image.width):this._setSize(n.image.width/4),or=this._renderer.getRenderTarget(),sr=this._renderer.getActiveCubeFace(),lr=this._renderer.getActiveMipmapLevel(),cr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(n,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let n=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:vt,minFilter:vt,generateMipmaps:!1,type:Ut,format:At,colorSpace:un,depthBuffer:!1},l=Xa(n,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==n||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Xa(n,t,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=mc(a)),this._blurMaterial=gc(a,n,t),this._ggxMaterial=_c(a,n,t)}return l}_compileMaterial(n){let t=new wt(new hn,n);this._renderer.compile(t,gn)}_sceneToCubeUV(n,t,i,l,a){let b=new mn(90,1,t,i),x=[1,-1,1,1,1,1],w=[1,1,1,-1,-1,-1],g=this._renderer,S=g.autoClear,R=g.toneMapping;g.getClearColor(za),g.toneMapping=Et,g.autoClear=!1,g.state.buffers.depth.getReversed()&&(g.setRenderTarget(l),g.clearDepth(),g.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new wt(new Qi,new Ua({name:"PMREM.Background",side:gt,depthWrite:!1,depthTest:!1})));let U=this._backgroundBox,f=U.material,o=!1,P=n.background;P?P.isColor&&(f.color.copy(P),n.background=null,o=!0):(f.color.copy(za),o=!0);for(let M=0;M<6;M++){let A=M%3;A===0?(b.up.set(0,x[M],0),b.position.set(a.x,a.y,a.z),b.lookAt(a.x+w[M],a.y,a.z)):A===1?(b.up.set(0,0,x[M]),b.position.set(a.x,a.y,a.z),b.lookAt(a.x,a.y+w[M],a.z)):(b.up.set(0,x[M],0),b.position.set(a.x,a.y,a.z),b.lookAt(a.x,a.y,a.z+w[M]));let C=this._cubeSize;tn(l,A*C,M>2?C:0,C,C),g.setRenderTarget(l),o&&g.render(U,b),g.render(n,b)}g.toneMapping=R,g.autoClear=S,n.background=P}_textureToCubeUV(n,t){let i=this._renderer,l=n.mapping===Qt||n.mapping===Gt;l?(this._cubemapMaterial===null&&(this._cubemapMaterial=qa()),this._cubemapMaterial.uniforms.flipEnvMap.value=n.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ya());let a=l?this._cubemapMaterial:this._equirectMaterial,h=this._lodMeshes[0];h.material=a;let d=a.uniforms;d.envMap.value=n;let b=this._cubeSize;tn(t,0,0,3*b,2*b),i.setRenderTarget(t),i.render(h,gn)}_applyPMREM(n){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let l=this._lodMeshes.length;for(let a=1;a<l;a++)this._applyGGXFilter(n,a-1,a);t.autoClear=i}_applyGGXFilter(n,t,i){let l=this._renderer,a=this._pingPongRenderTarget,h=this._ggxMaterial,d=this._lodMeshes[i];d.material=h;let b=h.uniforms,x=i/(this._lodMeshes.length-1),w=t/(this._lodMeshes.length-1),g=Math.sqrt(x*x-w*w),S=0+x*1.25,R=g*S,{_lodMax:O}=this,U=this._sizeLods[i],f=3*U*(i>O-Ft?i-O+Ft:0),o=4*(this._cubeSize-U);b.envMap.value=n.texture,b.roughness.value=R,b.mipInt.value=O-t,tn(a,f,o,3*U,2*U),l.setRenderTarget(a),l.render(d,gn),b.envMap.value=a.texture,b.roughness.value=0,b.mipInt.value=O-i,tn(n,f,o,3*U,2*U),l.setRenderTarget(n),l.render(d,gn)}_blur(n,t,i,l,a){let h=this._pingPongRenderTarget;this._halfBlur(n,h,t,i,l,"latitudinal",a),this._halfBlur(h,n,i,i,l,"longitudinal",a)}_halfBlur(n,t,i,l,a,h,d){let b=this._renderer,x=this._blurMaterial;h!=="latitudinal"&&h!=="longitudinal"&&Qe("blur direction must be either latitudinal or longitudinal!");let w=3,g=this._lodMeshes[l];g.material=x;let S=x.uniforms,R=this._sizeLods[i]-1,O=isFinite(a)?Math.PI/(2*R):2*Math.PI/(2*Yt-1),U=a/O,f=isFinite(a)?1+Math.floor(w*U):Yt;f>Yt&&ze(`sigmaRadians, ${a}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Yt}`);let o=[],P=0;for(let N=0;N<Yt;++N){let q=N/U,c=Math.exp(-q*q/2);o.push(c),N===0?P+=c:N<f&&(P+=2*c)}for(let N=0;N<o.length;N++)o[N]=o[N]/P;S.envMap.value=n.texture,S.samples.value=f,S.weights.value=o,S.latitudinal.value=h==="latitudinal",d&&(S.poleAxis.value=d);let{_lodMax:M}=this;S.dTheta.value=O,S.mipInt.value=M-i;let A=this._sizeLods[l],C=3*A*(l>M-Ft?l-M+Ft:0),T=4*(this._cubeSize-A);tn(t,C,T,3*A,2*A),b.setRenderTarget(t),b.render(g,gn)}};function mc(e){let n=[],t=[],i=[],l=e,a=e-Ft+1+Wa.length;for(let h=0;h<a;h++){let d=Math.pow(2,l);n.push(d);let b=1/d;h>e-Ft?b=Wa[h-e+Ft-1]:h===0&&(b=0),t.push(b);let x=1/(d-2),w=-x,g=1+x,S=[w,w,g,w,g,g,w,w,g,g,w,g],R=6,O=6,U=3,f=2,o=1,P=new Float32Array(U*O*R),M=new Float32Array(f*O*R),A=new Float32Array(o*O*R);for(let T=0;T<R;T++){let N=T%3*2/3-1,q=T>2?0:-1,c=[N,q,0,N+2/3,q,0,N+2/3,q+1,0,N,q,0,N+2/3,q+1,0,N,q+1,0];P.set(c,U*O*T),M.set(S,f*O*T);let p=[T,T,T,T,T,T];A.set(p,o*O*T)}let C=new hn;C.setAttribute("position",new pn(P,U)),C.setAttribute("uv",new pn(M,f)),C.setAttribute("faceIndex",new pn(A,o)),i.push(new wt(C,null)),l>Ft&&l--}return{lodMeshes:i,sizeLods:n,sigmas:t}}function Xa(e,n,t){let i=new Rt(e,n,t);return i.texture.mapping=cn,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function tn(e,n,t,i,l){e.viewport.set(n,t,i,l),e.scissor.set(n,t,i,l)}function _c(e,n,t){return new It({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:pc,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:zn(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Lt,depthTest:!1,depthWrite:!1})}function gc(e,n,t){let i=new Float32Array(Yt),l=new Oe(0,1,0);return new It({name:"SphericalGaussianBlur",defines:{n:Yt,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:l}},vertexShader:zn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Lt,depthTest:!1,depthWrite:!1})}function Ya(){return new It({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Lt,depthTest:!1,depthWrite:!1})}function qa(){return new It({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zn(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Lt,depthTest:!1,depthWrite:!1})}function zn(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function vc(e){let n=new WeakMap,t=null;function i(d){if(d&&d.isTexture){let b=d.mapping,x=b===Ln||b===Dn,w=b===Qt||b===Gt;if(x||w){let g=n.get(d),S=g!==void 0?g.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==S)return t===null&&(t=new Wn(e)),g=x?t.fromEquirectangular(d,g):t.fromCubemap(d,g),g.texture.pmremVersion=d.pmremVersion,n.set(d,g),g.texture;if(g!==void 0)return g.texture;{let R=d.image;return x&&R&&R.height>0||w&&R&&l(R)?(t===null&&(t=new Wn(e)),g=x?t.fromEquirectangular(d):t.fromCubemap(d),g.texture.pmremVersion=d.pmremVersion,n.set(d,g),d.addEventListener("dispose",a),g.texture):null}}}return d}function l(d){let b=0,x=6;for(let w=0;w<x;w++)d[w]!==void 0&&b++;return b===x}function a(d){let b=d.target;b.removeEventListener("dispose",a);let x=n.get(b);x!==void 0&&(n.delete(b),x.dispose())}function h(){n=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:h}}function Sc(e){let n={};function t(i){if(n[i]!==void 0)return n[i];let l=e.getExtension(i);return n[i]=l,l}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let l=t(i);return l===null&&Gn("WebGLRenderer: "+i+" extension not supported."),l}}}function Ec(e,n,t,i){let l={},a=new WeakMap;function h(g){let S=g.target;S.index!==null&&n.remove(S.index);for(let O in S.attributes)n.remove(S.attributes[O]);S.removeEventListener("dispose",h),delete l[S.id];let R=a.get(S);R&&(n.remove(R),a.delete(S)),i.releaseStatesOfGeometry(S),S.isInstancedBufferGeometry===!0&&delete S._maxInstanceCount,t.memory.geometries--}function d(g,S){return l[S.id]===!0||(S.addEventListener("dispose",h),l[S.id]=!0,t.memory.geometries++),S}function b(g){let S=g.attributes;for(let R in S)n.update(S[R],e.ARRAY_BUFFER)}function x(g){let S=[],R=g.index,O=g.attributes.position,U=0;if(R!==null){let P=R.array;U=R.version;for(let M=0,A=P.length;M<A;M+=3){let C=P[M+0],T=P[M+1],N=P[M+2];S.push(C,T,T,N,N,C)}}else if(O!==void 0){let P=O.array;U=O.version;for(let M=0,A=P.length/3-1;M<A;M+=3){let C=M+0,T=M+1,N=M+2;S.push(C,T,T,N,N,C)}}else return;let f=new(Ma(S)?Ia:wa)(S,1);f.version=U;let o=a.get(g);o&&n.remove(o),a.set(g,f)}function w(g){let S=a.get(g);if(S){let R=g.index;R!==null&&S.version<R.version&&x(g)}else x(g);return a.get(g)}return{get:d,update:b,getWireframeAttribute:w}}function xc(e,n,t){let i;function l(S){i=S}let a,h;function d(S){a=S.type,h=S.bytesPerElement}function b(S,R){e.drawElements(i,R,a,S*h),t.update(R,i,1)}function x(S,R,O){O!==0&&(e.drawElementsInstanced(i,R,a,S*h,O),t.update(R,i,O))}function w(S,R,O){if(O===0)return;n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,R,0,a,S,0,O);let f=0;for(let o=0;o<O;o++)f+=R[o];t.update(f,i,1)}function g(S,R,O,U){if(O===0)return;let f=n.get("WEBGL_multi_draw");if(f===null)for(let o=0;o<S.length;o++)x(S[o]/h,R[o],U[o]);else{f.multiDrawElementsInstancedWEBGL(i,R,0,a,S,0,U,0,O);let o=0;for(let P=0;P<O;P++)o+=R[P]*U[P];t.update(o,i,1)}}this.setMode=l,this.setIndex=d,this.render=b,this.renderInstances=x,this.renderMultiDraw=w,this.renderMultiDrawInstances=g}function Mc(e){let n={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,h,d){switch(t.calls++,h){case e.TRIANGLES:t.triangles+=d*(a/3);break;case e.LINES:t.lines+=d*(a/2);break;case e.LINE_STRIP:t.lines+=d*(a-1);break;case e.LINE_LOOP:t.lines+=d*a;break;case e.POINTS:t.points+=d*a;break;default:Qe("WebGLInfo: Unknown draw mode:",h);break}}function l(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:n,render:t,programs:null,autoReset:!0,reset:l,update:i}}function Tc(e,n,t){let i=new WeakMap,l=new dt;function a(h,d,b){let x=h.morphTargetInfluences,w=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,g=w!==void 0?w.length:0,S=i.get(d);if(S===void 0||S.count!==g){let c=function(){N.dispose(),i.delete(d),d.removeEventListener("dispose",c)};S!==void 0&&S.texture.dispose();let R=d.morphAttributes.position!==void 0,O=d.morphAttributes.normal!==void 0,U=d.morphAttributes.color!==void 0,f=d.morphAttributes.position||[],o=d.morphAttributes.normal||[],P=d.morphAttributes.color||[],M=0;R===!0&&(M=1),O===!0&&(M=2),U===!0&&(M=3);let A=d.attributes.position.count*M,C=1;A>n.maxTextureSize&&(C=Math.ceil(A/n.maxTextureSize),A=n.maxTextureSize);let T=new Float32Array(A*C*4*g),N=new Ki(T,A,C,g);N.type=Dt,N.needsUpdate=!0;let q=M*4;for(let p=0;p<g;p++){let L=f[p],k=o[p],G=P[p],z=A*C*4*p;for(let K=0;K<L.count;K++){let B=K*q;R===!0&&(l.fromBufferAttribute(L,K),T[z+B+0]=l.x,T[z+B+1]=l.y,T[z+B+2]=l.z,T[z+B+3]=0),O===!0&&(l.fromBufferAttribute(k,K),T[z+B+4]=l.x,T[z+B+5]=l.y,T[z+B+6]=l.z,T[z+B+7]=0),U===!0&&(l.fromBufferAttribute(G,K),T[z+B+8]=l.x,T[z+B+9]=l.y,T[z+B+10]=l.z,T[z+B+11]=G.itemSize===4?l.w:1)}}S={count:g,texture:N,size:new ft(A,C)},i.set(d,S),d.addEventListener("dispose",c)}if(h.isInstancedMesh===!0&&h.morphTexture!==null)b.getUniforms().setValue(e,"morphTexture",h.morphTexture,t);else{let R=0;for(let U=0;U<x.length;U++)R+=x[U];let O=d.morphTargetsRelative?1:1-R;b.getUniforms().setValue(e,"morphTargetBaseInfluence",O),b.getUniforms().setValue(e,"morphTargetInfluences",x)}b.getUniforms().setValue(e,"morphTargetsTexture",S.texture,t),b.getUniforms().setValue(e,"morphTargetsTextureSize",S.size)}return{update:a}}function Ac(e,n,t,i){let l=new WeakMap;function a(b){let x=i.render.frame,w=b.geometry,g=n.get(b,w);if(l.get(g)!==x&&(n.update(g),l.set(g,x)),b.isInstancedMesh&&(b.hasEventListener("dispose",d)===!1&&b.addEventListener("dispose",d),l.get(b)!==x&&(t.update(b.instanceMatrix,e.ARRAY_BUFFER),b.instanceColor!==null&&t.update(b.instanceColor,e.ARRAY_BUFFER),l.set(b,x))),b.isSkinnedMesh){let S=b.skeleton;l.get(S)!==x&&(S.update(),l.set(S,x))}return g}function h(){l=new WeakMap}function d(b){let x=b.target;x.removeEventListener("dispose",d),t.remove(x.instanceMatrix),x.instanceColor!==null&&t.remove(x.instanceColor)}return{update:a,dispose:h}}var Rc={[jn]:"LINEAR_TONE_MAPPING",[ei]:"REINHARD_TONE_MAPPING",[ti]:"CINEON_TONE_MAPPING",[ni]:"ACES_FILMIC_TONE_MAPPING",[ri]:"AGX_TONE_MAPPING",[ai]:"NEUTRAL_TONE_MAPPING",[ii]:"CUSTOM_TONE_MAPPING"};function bc(e,n,t,i,l){let a=new Rt(n,t,{type:e,depthBuffer:i,stencilBuffer:l}),h=new Rt(n,t,{type:Ut,depthBuffer:!1,stencilBuffer:!1}),d=new hn;d.setAttribute("position",new Zi([-1,3,0,-1,-1,0,3,-1,0],3)),d.setAttribute("uv",new Zi([0,2,0,0,2,0],2));let b=new Ga({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),x=new wt(d,b),w=new rr(-1,1,1,-1,0,1),g=null,S=null,R=!1,O,U=null,f=[],o=!1;this.setSize=function(P,M){a.setSize(P,M),h.setSize(P,M);for(let A=0;A<f.length;A++){let C=f[A];C.setSize&&C.setSize(P,M)}},this.setEffects=function(P){f=P,o=f.length>0&&f[0].isRenderPass===!0;let M=a.width,A=a.height;for(let C=0;C<f.length;C++){let T=f[C];T.setSize&&T.setSize(M,A)}},this.begin=function(P,M){if(R||P.toneMapping===Et&&f.length===0)return!1;if(U=M,M!==null){let A=M.width,C=M.height;(a.width!==A||a.height!==C)&&this.setSize(A,C)}return o===!1&&P.setRenderTarget(a),O=P.toneMapping,P.toneMapping=Et,!0},this.hasRenderPass=function(){return o},this.end=function(P,M){P.toneMapping=O,R=!0;let A=a,C=h;for(let T=0;T<f.length;T++){let N=f[T];if(N.enabled!==!1&&(N.render(P,C,A,M),N.needsSwap!==!1)){let q=A;A=C,C=q}}if(g!==P.outputColorSpace||S!==P.toneMapping){g=P.outputColorSpace,S=P.toneMapping,b.defines={},nt.getTransfer(g)===qe&&(b.defines.SRGB_TRANSFER="");let T=Rc[S];T&&(b.defines[T]=""),b.needsUpdate=!0}b.uniforms.tDiffuse.value=A.texture,P.setRenderTarget(U),P.render(x,w),U=null,R=!1},this.isCompositing=function(){return R},this.dispose=function(){a.dispose(),h.dispose(),d.dispose(),b.dispose()}}var ho=new Pa,ur=new _n(1,1),mo=new Ki,_o=new La,go=new ya,Ka=[],$a=[],Za=new Float32Array(16),Qa=new Float32Array(9),Ja=new Float32Array(4);function rn(e,n,t){let i=e[0];if(i<=0||i>0)return e;let l=n*t,a=Ka[l];if(a===void 0&&(a=new Float32Array(l),Ka[l]=a),n!==0){i.toArray(a,0);for(let h=1,d=0;h!==n;++h)d+=t,e[h].toArray(a,d)}return a}function ot(e,n){if(e.length!==n.length)return!1;for(let t=0,i=e.length;t<i;t++)if(e[t]!==n[t])return!1;return!0}function st(e,n){for(let t=0,i=n.length;t<i;t++)e[t]=n[t]}function Xn(e,n){let t=$a[n];t===void 0&&(t=new Int32Array(n),$a[n]=t);for(let i=0;i!==n;++i)t[i]=e.allocateTextureUnit();return t}function Cc(e,n){let t=this.cache;t[0]!==n&&(e.uniform1f(this.addr,n),t[0]=n)}function Pc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2f(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ot(t,n))return;e.uniform2fv(this.addr,n),st(t,n)}}function Lc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3f(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else if(n.r!==void 0)(t[0]!==n.r||t[1]!==n.g||t[2]!==n.b)&&(e.uniform3f(this.addr,n.r,n.g,n.b),t[0]=n.r,t[1]=n.g,t[2]=n.b);else{if(ot(t,n))return;e.uniform3fv(this.addr,n),st(t,n)}}function Dc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4f(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ot(t,n))return;e.uniform4fv(this.addr,n),st(t,n)}}function Uc(e,n){let t=this.cache,i=n.elements;if(i===void 0){if(ot(t,n))return;e.uniformMatrix2fv(this.addr,!1,n),st(t,n)}else{if(ot(t,i))return;Ja.set(i),e.uniformMatrix2fv(this.addr,!1,Ja),st(t,i)}}function wc(e,n){let t=this.cache,i=n.elements;if(i===void 0){if(ot(t,n))return;e.uniformMatrix3fv(this.addr,!1,n),st(t,n)}else{if(ot(t,i))return;Qa.set(i),e.uniformMatrix3fv(this.addr,!1,Qa),st(t,i)}}function Ic(e,n){let t=this.cache,i=n.elements;if(i===void 0){if(ot(t,n))return;e.uniformMatrix4fv(this.addr,!1,n),st(t,n)}else{if(ot(t,i))return;Za.set(i),e.uniformMatrix4fv(this.addr,!1,Za),st(t,i)}}function Nc(e,n){let t=this.cache;t[0]!==n&&(e.uniform1i(this.addr,n),t[0]=n)}function yc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2i(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ot(t,n))return;e.uniform2iv(this.addr,n),st(t,n)}}function Fc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3i(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(ot(t,n))return;e.uniform3iv(this.addr,n),st(t,n)}}function Oc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4i(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ot(t,n))return;e.uniform4iv(this.addr,n),st(t,n)}}function Bc(e,n){let t=this.cache;t[0]!==n&&(e.uniform1ui(this.addr,n),t[0]=n)}function Gc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2ui(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(ot(t,n))return;e.uniform2uiv(this.addr,n),st(t,n)}}function Hc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3ui(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(ot(t,n))return;e.uniform3uiv(this.addr,n),st(t,n)}}function Vc(e,n){let t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4ui(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(ot(t,n))return;e.uniform4uiv(this.addr,n),st(t,n)}}function kc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l);let a;this.type===e.SAMPLER_2D_SHADOW?(ur.compareFunction=t.isReversedDepthBuffer()?Bn:On,a=ur):a=ho,t.setTexture2D(n||a,l)}function Wc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l),t.setTexture3D(n||_o,l)}function zc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l),t.setTextureCube(n||go,l)}function Xc(e,n,t){let i=this.cache,l=t.allocateTextureUnit();i[0]!==l&&(e.uniform1i(this.addr,l),i[0]=l),t.setTexture2DArray(n||mo,l)}function Yc(e){switch(e){case 5126:return Cc;case 35664:return Pc;case 35665:return Lc;case 35666:return Dc;case 35674:return Uc;case 35675:return wc;case 35676:return Ic;case 5124:case 35670:return Nc;case 35667:case 35671:return yc;case 35668:case 35672:return Fc;case 35669:case 35673:return Oc;case 5125:return Bc;case 36294:return Gc;case 36295:return Hc;case 36296:return Vc;case 35678:case 36198:case 36298:case 36306:case 35682:return kc;case 35679:case 36299:case 36307:return Wc;case 35680:case 36300:case 36308:case 36293:return zc;case 36289:case 36303:case 36311:case 36292:return Xc}}function qc(e,n){e.uniform1fv(this.addr,n)}function Kc(e,n){let t=rn(n,this.size,2);e.uniform2fv(this.addr,t)}function $c(e,n){let t=rn(n,this.size,3);e.uniform3fv(this.addr,t)}function Zc(e,n){let t=rn(n,this.size,4);e.uniform4fv(this.addr,t)}function Qc(e,n){let t=rn(n,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function Jc(e,n){let t=rn(n,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function jc(e,n){let t=rn(n,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function ef(e,n){e.uniform1iv(this.addr,n)}function tf(e,n){e.uniform2iv(this.addr,n)}function nf(e,n){e.uniform3iv(this.addr,n)}function rf(e,n){e.uniform4iv(this.addr,n)}function af(e,n){e.uniform1uiv(this.addr,n)}function of(e,n){e.uniform2uiv(this.addr,n)}function sf(e,n){e.uniform3uiv(this.addr,n)}function lf(e,n){e.uniform4uiv(this.addr,n)}function cf(e,n,t){let i=this.cache,l=n.length,a=Xn(t,l);ot(i,a)||(e.uniform1iv(this.addr,a),st(i,a));let h;this.type===e.SAMPLER_2D_SHADOW?h=ur:h=ho;for(let d=0;d!==l;++d)t.setTexture2D(n[d]||h,a[d])}function ff(e,n,t){let i=this.cache,l=n.length,a=Xn(t,l);ot(i,a)||(e.uniform1iv(this.addr,a),st(i,a));for(let h=0;h!==l;++h)t.setTexture3D(n[h]||_o,a[h])}function df(e,n,t){let i=this.cache,l=n.length,a=Xn(t,l);ot(i,a)||(e.uniform1iv(this.addr,a),st(i,a));for(let h=0;h!==l;++h)t.setTextureCube(n[h]||go,a[h])}function uf(e,n,t){let i=this.cache,l=n.length,a=Xn(t,l);ot(i,a)||(e.uniform1iv(this.addr,a),st(i,a));for(let h=0;h!==l;++h)t.setTexture2DArray(n[h]||mo,a[h])}function pf(e){switch(e){case 5126:return qc;case 35664:return Kc;case 35665:return $c;case 35666:return Zc;case 35674:return Qc;case 35675:return Jc;case 35676:return jc;case 5124:case 35670:return ef;case 35667:case 35671:return tf;case 35668:case 35672:return nf;case 35669:case 35673:return rf;case 5125:return af;case 36294:return of;case 36295:return sf;case 36296:return lf;case 35678:case 36198:case 36298:case 36306:case 35682:return cf;case 35679:case 36299:case 36307:return ff;case 35680:case 36300:case 36308:case 36293:return df;case 36289:case 36303:case 36311:case 36292:return uf}}var pr=class{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Yc(t.type)}},hr=class{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=pf(t.type)}},mr=class{constructor(n){this.id=n,this.seq=[],this.map={}}setValue(n,t,i){let l=this.seq;for(let a=0,h=l.length;a!==h;++a){let d=l[a];d.setValue(n,t[d.id],i)}}},fr=/(\w+)(\])?(\[|\.)?/g;function ja(e,n){e.seq.push(n),e.map[n.id]=n}function hf(e,n,t){let i=e.name,l=i.length;for(fr.lastIndex=0;;){let a=fr.exec(i),h=fr.lastIndex,d=a[1],b=a[2]==="]",x=a[3];if(b&&(d=d|0),x===void 0||x==="["&&h+2===l){ja(t,x===void 0?new pr(d,e,n):new hr(d,e,n));break}else{let g=t.map[d];g===void 0&&(g=new mr(d),ja(t,g)),t=g}}}var nn=class{constructor(n,t){this.seq=[],this.map={};let i=n.getProgramParameter(t,n.ACTIVE_UNIFORMS);for(let h=0;h<i;++h){let d=n.getActiveUniform(t,h),b=n.getUniformLocation(t,d.name);hf(d,b,this)}let l=[],a=[];for(let h of this.seq)h.type===n.SAMPLER_2D_SHADOW||h.type===n.SAMPLER_CUBE_SHADOW||h.type===n.SAMPLER_2D_ARRAY_SHADOW?l.push(h):a.push(h);l.length>0&&(this.seq=l.concat(a))}setValue(n,t,i,l){let a=this.map[t];a!==void 0&&a.setValue(n,i,l)}setOptional(n,t,i){let l=t[i];l!==void 0&&this.setValue(n,i,l)}static upload(n,t,i,l){for(let a=0,h=t.length;a!==h;++a){let d=t[a],b=i[d.id];b.needsUpdate!==!1&&d.setValue(n,b.value,l)}}static seqWithValue(n,t){let i=[];for(let l=0,a=n.length;l!==a;++l){let h=n[l];h.id in t&&i.push(h)}return i}};function eo(e,n,t){let i=e.createShader(n);return e.shaderSource(i,t),e.compileShader(i),i}var mf=37297,_f=0;function gf(e,n){let t=e.split(`
`),i=[],l=Math.max(n-6,0),a=Math.min(n+6,t.length);for(let h=l;h<a;h++){let d=h+1;i.push(`${d===n?">":" "} ${d}: ${t[h]}`)}return i.join(`
`)}var to=new Ne;function vf(e){nt._getMatrix(to,nt.workingColorSpace,e);let n=`mat3( ${to.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(e)){case zi:return[n,"LinearTransferOETF"];case qe:return[n,"sRGBTransferOETF"];default:return ze("WebGLProgram: Unsupported color space: ",e),[n,"LinearTransferOETF"]}}function no(e,n,t){let i=e.getShaderParameter(n,e.COMPILE_STATUS),a=(e.getShaderInfoLog(n)||"").trim();if(i&&a==="")return"";let h=/ERROR: 0:(\d+)/.exec(a);if(h){let d=parseInt(h[1]);return t.toUpperCase()+`

`+a+`

`+gf(e.getShaderSource(n),d)}else return a}function Sf(e,n){let t=vf(n);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Ef={[jn]:"Linear",[ei]:"Reinhard",[ti]:"Cineon",[ni]:"ACESFilmic",[ri]:"AgX",[ai]:"Neutral",[ii]:"Custom"};function xf(e,n){let t=Ef[n];return t===void 0?(ze("WebGLProgram: Unsupported toneMapping:",n),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var kn=new Oe;function Mf(){nt.getLuminanceCoefficients(kn);let e=kn.x.toFixed(4),n=kn.y.toFixed(4),t=kn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${n}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Tf(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Sn).join(`
`)}function Af(e){let n=[];for(let t in e){let i=e[t];i!==!1&&n.push("#define "+t+" "+i)}return n.join(`
`)}function Rf(e,n){let t={},i=e.getProgramParameter(n,e.ACTIVE_ATTRIBUTES);for(let l=0;l<i;l++){let a=e.getActiveAttrib(n,l),h=a.name,d=1;a.type===e.FLOAT_MAT2&&(d=2),a.type===e.FLOAT_MAT3&&(d=3),a.type===e.FLOAT_MAT4&&(d=4),t[h]={type:a.type,location:e.getAttribLocation(n,h),locationSize:d}}return t}function Sn(e){return e!==""}function io(e,n){let t=n.numSpotLightShadows+n.numSpotLightMaps-n.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,n.numDirLights).replace(/NUM_SPOT_LIGHTS/g,n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,n.numPointLights).replace(/NUM_HEMI_LIGHTS/g,n.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,n.numPointLightShadows)}function ro(e,n){return e.replace(/NUM_CLIPPING_PLANES/g,n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,n.numClippingPlanes-n.numClipIntersection)}var bf=/^[ \t]*#include +<([\w\d./]+)>/gm;function _r(e){return e.replace(bf,Pf)}var Cf=new Map;function Pf(e,n){let t=Pe[n];if(t===void 0){let i=Cf.get(n);if(i!==void 0)t=Pe[i],ze('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',n,i);else throw new Error("Can not resolve #include <"+n+">")}return _r(t)}var Lf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ao(e){return e.replace(Lf,Df)}function Df(e,n,t,i){let l="";for(let a=parseInt(n);a<parseInt(t);a++)l+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return l}function oo(e){let n=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?n+=`
#define HIGH_PRECISION`:e.precision==="mediump"?n+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(n+=`
#define LOW_PRECISION`),n}var Uf={[on]:"SHADOWMAP_TYPE_PCF",[Kt]:"SHADOWMAP_TYPE_VSM"};function wf(e){return Uf[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var If={[Qt]:"ENVMAP_TYPE_CUBE",[Gt]:"ENVMAP_TYPE_CUBE",[cn]:"ENVMAP_TYPE_CUBE_UV"};function Nf(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":If[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var yf={[Gt]:"ENVMAP_MODE_REFRACTION"};function Ff(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":yf[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Of={[ea]:"ENVMAP_BLENDING_MULTIPLY",[ta]:"ENVMAP_BLENDING_MIX",[na]:"ENVMAP_BLENDING_ADD"};function Bf(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":Of[e.combine]||"ENVMAP_BLENDING_NONE"}function Gf(e){let n=e.envMapCubeUVHeight;if(n===null)return null;let t=Math.log2(n)-2,i=1/n;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Hf(e,n,t,i){let l=e.getContext(),a=t.defines,h=t.vertexShader,d=t.fragmentShader,b=wf(t),x=Nf(t),w=Ff(t),g=Bf(t),S=Gf(t),R=Tf(t),O=Af(a),U=l.createProgram(),f,o,P=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,O].filter(Sn).join(`
`),f.length>0&&(f+=`
`),o=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,O].filter(Sn).join(`
`),o.length>0&&(o+=`
`)):(f=[oo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,O,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+w:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+b:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Sn).join(`
`),o=[oo(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,O,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+x:"",t.envMap?"#define "+w:"",t.envMap?"#define "+g:"",S?"#define CUBEUV_TEXEL_WIDTH "+S.texelWidth:"",S?"#define CUBEUV_TEXEL_HEIGHT "+S.texelHeight:"",S?"#define CUBEUV_MAX_MIP "+S.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+b:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Et?"#define TONE_MAPPING":"",t.toneMapping!==Et?Pe.tonemapping_pars_fragment:"",t.toneMapping!==Et?xf("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Pe.colorspace_pars_fragment,Sf("linearToOutputTexel",t.outputColorSpace),Mf(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Sn).join(`
`)),h=_r(h),h=io(h,t),h=ro(h,t),d=_r(d),d=io(d,t),d=ro(d,t),h=ao(h),d=ao(d),t.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,f=[R,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,o=["#define varying in",t.glslVersion===Xi?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Xi?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+o);let M=P+f+h,A=P+o+d,C=eo(l,l.VERTEX_SHADER,M),T=eo(l,l.FRAGMENT_SHADER,A);l.attachShader(U,C),l.attachShader(U,T),t.index0AttributeName!==void 0?l.bindAttribLocation(U,0,t.index0AttributeName):t.morphTargets===!0&&l.bindAttribLocation(U,0,"position"),l.linkProgram(U);function N(L){if(e.debug.checkShaderErrors){let k=l.getProgramInfoLog(U)||"",G=l.getShaderInfoLog(C)||"",z=l.getShaderInfoLog(T)||"",K=k.trim(),B=G.trim(),V=z.trim(),J=!0,xe=!0;if(l.getProgramParameter(U,l.LINK_STATUS)===!1)if(J=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(l,U,C,T);else{let ge=no(l,C,"vertex"),Ee=no(l,T,"fragment");Qe("THREE.WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(U,l.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+K+`
`+ge+`
`+Ee)}else K!==""?ze("WebGLProgram: Program Info Log:",K):(B===""||V==="")&&(xe=!1);xe&&(L.diagnostics={runnable:J,programLog:K,vertexShader:{log:B,prefix:f},fragmentShader:{log:V,prefix:o}})}l.deleteShader(C),l.deleteShader(T),q=new nn(l,U),c=Rf(l,U)}let q;this.getUniforms=function(){return q===void 0&&N(this),q};let c;this.getAttributes=function(){return c===void 0&&N(this),c};let p=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return p===!1&&(p=l.getProgramParameter(U,mf)),p},this.destroy=function(){i.releaseStatesOfProgram(this),l.deleteProgram(U),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=_f++,this.cacheKey=n,this.usedTimes=1,this.program=U,this.vertexShader=C,this.fragmentShader=T,this}var Vf=0,gr=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(n){let t=n.vertexShader,i=n.fragmentShader,l=this._getShaderStage(t),a=this._getShaderStage(i),h=this._getShaderCacheForMaterial(n);return h.has(l)===!1&&(h.add(l),l.usedTimes++),h.has(a)===!1&&(h.add(a),a.usedTimes++),this}remove(n){let t=this.materialCache.get(n);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(n),this}getVertexShaderID(n){return this._getShaderStage(n.vertexShader).id}getFragmentShaderID(n){return this._getShaderStage(n.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(n){let t=this.materialCache,i=t.get(n);return i===void 0&&(i=new Set,t.set(n,i)),i}_getShaderStage(n){let t=this.shaderCache,i=t.get(n);return i===void 0&&(i=new vr(n),t.set(n,i)),i}},vr=class{constructor(n){this.id=Vf++,this.code=n,this.usedTimes=0}};function kf(e,n,t,i,l,a,h){let d=new Da,b=new gr,x=new Set,w=[],g=new Map,S=l.logarithmicDepthBuffer,R=l.precision,O={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function U(c){return x.add(c),c===0?"uv":`uv${c}`}function f(c,p,L,k,G){let z=k.fog,K=G.geometry,B=c.isMeshStandardMaterial?k.environment:null,V=(c.isMeshStandardMaterial?t:n).get(c.envMap||B),J=V&&V.mapping===cn?V.image.height:null,xe=O[c.type];c.precision!==null&&(R=l.getMaxPrecision(c.precision),R!==c.precision&&ze("WebGLProgram.getParameters:",c.precision,"not supported, using",R,"instead."));let ge=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Ee=ge!==void 0?ge.length:0,Be=0;K.morphAttributes.position!==void 0&&(Be=1),K.morphAttributes.normal!==void 0&&(Be=2),K.morphAttributes.color!==void 0&&(Be=3);let we,it,je,W;if(xe){let Ve=Ct[xe];we=Ve.vertexShader,it=Ve.fragmentShader}else we=c.vertexShader,it=c.fragmentShader,b.update(c),je=b.getVertexShaderID(c),W=b.getFragmentShaderID(c);let $=e.getRenderTarget(),fe=e.state.buffers.depth.getReversed(),Ce=G.isInstancedMesh===!0,pe=G.isBatchedMesh===!0,ye=!!c.map,lt=!!c.matcap,Ie=!!V,He=!!c.aoMap,Xe=!!c.lightMap,Le=!!c.bumpMap,rt=!!c.normalMap,m=!!c.displacementMap,at=!!c.emissiveMap,Ge=!!c.metalnessMap,Ke=!!c.roughnessMap,me=c.anisotropy>0,u=c.clearcoat>0,r=c.dispersion>0,v=c.iridescence>0,H=c.sheen>0,Y=c.transmission>0,F=me&&!!c.anisotropyMap,ve=u&&!!c.clearcoatMap,te=u&&!!c.clearcoatNormalMap,he=u&&!!c.clearcoatRoughnessMap,Re=v&&!!c.iridescenceMap,Q=v&&!!c.iridescenceThicknessMap,ie=H&&!!c.sheenColorMap,ue=H&&!!c.sheenRoughnessMap,_e=!!c.specularMap,ne=!!c.specularColorMap,De=!!c.specularIntensityMap,_=Y&&!!c.transmissionMap,se=Y&&!!c.thicknessMap,j=!!c.gradientMap,le=!!c.alphaMap,Z=c.alphaTest>0,X=!!c.alphaHash,ee=!!c.extensions,be=Et;c.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(be=e.toneMapping);let $e={shaderID:xe,shaderType:c.type,shaderName:c.name,vertexShader:we,fragmentShader:it,defines:c.defines,customVertexShaderID:je,customFragmentShaderID:W,isRawShaderMaterial:c.isRawShaderMaterial===!0,glslVersion:c.glslVersion,precision:R,batching:pe,batchingColor:pe&&G._colorsTexture!==null,instancing:Ce,instancingColor:Ce&&G.instanceColor!==null,instancingMorph:Ce&&G.morphTexture!==null,outputColorSpace:$===null?e.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:un,alphaToCoverage:!!c.alphaToCoverage,map:ye,matcap:lt,envMap:Ie,envMapMode:Ie&&V.mapping,envMapCubeUVHeight:J,aoMap:He,lightMap:Xe,bumpMap:Le,normalMap:rt,displacementMap:m,emissiveMap:at,normalMapObjectSpace:rt&&c.normalMapType===ha,normalMapTangentSpace:rt&&c.normalMapType===pa,metalnessMap:Ge,roughnessMap:Ke,anisotropy:me,anisotropyMap:F,clearcoat:u,clearcoatMap:ve,clearcoatNormalMap:te,clearcoatRoughnessMap:he,dispersion:r,iridescence:v,iridescenceMap:Re,iridescenceThicknessMap:Q,sheen:H,sheenColorMap:ie,sheenRoughnessMap:ue,specularMap:_e,specularColorMap:ne,specularIntensityMap:De,transmission:Y,transmissionMap:_,thicknessMap:se,gradientMap:j,opaque:c.transparent===!1&&c.blending===sn&&c.alphaToCoverage===!1,alphaMap:le,alphaTest:Z,alphaHash:X,combine:c.combine,mapUv:ye&&U(c.map.channel),aoMapUv:He&&U(c.aoMap.channel),lightMapUv:Xe&&U(c.lightMap.channel),bumpMapUv:Le&&U(c.bumpMap.channel),normalMapUv:rt&&U(c.normalMap.channel),displacementMapUv:m&&U(c.displacementMap.channel),emissiveMapUv:at&&U(c.emissiveMap.channel),metalnessMapUv:Ge&&U(c.metalnessMap.channel),roughnessMapUv:Ke&&U(c.roughnessMap.channel),anisotropyMapUv:F&&U(c.anisotropyMap.channel),clearcoatMapUv:ve&&U(c.clearcoatMap.channel),clearcoatNormalMapUv:te&&U(c.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:he&&U(c.clearcoatRoughnessMap.channel),iridescenceMapUv:Re&&U(c.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&U(c.iridescenceThicknessMap.channel),sheenColorMapUv:ie&&U(c.sheenColorMap.channel),sheenRoughnessMapUv:ue&&U(c.sheenRoughnessMap.channel),specularMapUv:_e&&U(c.specularMap.channel),specularColorMapUv:ne&&U(c.specularColorMap.channel),specularIntensityMapUv:De&&U(c.specularIntensityMap.channel),transmissionMapUv:_&&U(c.transmissionMap.channel),thicknessMapUv:se&&U(c.thicknessMap.channel),alphaMapUv:le&&U(c.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(rt||me),vertexColors:c.vertexColors,vertexAlphas:c.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!K.attributes.uv&&(ye||le),fog:!!z,useFog:c.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:c.flatShading===!0&&c.wireframe===!1,sizeAttenuation:c.sizeAttenuation===!0,logarithmicDepthBuffer:S,reversedDepthBuffer:fe,skinning:G.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:Ee,morphTextureStride:Be,numDirLights:p.directional.length,numPointLights:p.point.length,numSpotLights:p.spot.length,numSpotLightMaps:p.spotLightMap.length,numRectAreaLights:p.rectArea.length,numHemiLights:p.hemi.length,numDirLightShadows:p.directionalShadowMap.length,numPointLightShadows:p.pointShadowMap.length,numSpotLightShadows:p.spotShadowMap.length,numSpotLightShadowsWithMaps:p.numSpotLightShadowsWithMaps,numLightProbes:p.numLightProbes,numClippingPlanes:h.numPlanes,numClipIntersection:h.numIntersection,dithering:c.dithering,shadowMapEnabled:e.shadowMap.enabled&&L.length>0,shadowMapType:e.shadowMap.type,toneMapping:be,decodeVideoTexture:ye&&c.map.isVideoTexture===!0&&nt.getTransfer(c.map.colorSpace)===qe,decodeVideoTextureEmissive:at&&c.emissiveMap.isVideoTexture===!0&&nt.getTransfer(c.emissiveMap.colorSpace)===qe,premultipliedAlpha:c.premultipliedAlpha,doubleSided:c.side===Tt,flipSided:c.side===gt,useDepthPacking:c.depthPacking>=0,depthPacking:c.depthPacking||0,index0AttributeName:c.index0AttributeName,extensionClipCullDistance:ee&&c.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ee&&c.extensions.multiDraw===!0||pe)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:c.customProgramCacheKey()};return $e.vertexUv1s=x.has(1),$e.vertexUv2s=x.has(2),$e.vertexUv3s=x.has(3),x.clear(),$e}function o(c){let p=[];if(c.shaderID?p.push(c.shaderID):(p.push(c.customVertexShaderID),p.push(c.customFragmentShaderID)),c.defines!==void 0)for(let L in c.defines)p.push(L),p.push(c.defines[L]);return c.isRawShaderMaterial===!1&&(P(p,c),M(p,c),p.push(e.outputColorSpace)),p.push(c.customProgramCacheKey),p.join()}function P(c,p){c.push(p.precision),c.push(p.outputColorSpace),c.push(p.envMapMode),c.push(p.envMapCubeUVHeight),c.push(p.mapUv),c.push(p.alphaMapUv),c.push(p.lightMapUv),c.push(p.aoMapUv),c.push(p.bumpMapUv),c.push(p.normalMapUv),c.push(p.displacementMapUv),c.push(p.emissiveMapUv),c.push(p.metalnessMapUv),c.push(p.roughnessMapUv),c.push(p.anisotropyMapUv),c.push(p.clearcoatMapUv),c.push(p.clearcoatNormalMapUv),c.push(p.clearcoatRoughnessMapUv),c.push(p.iridescenceMapUv),c.push(p.iridescenceThicknessMapUv),c.push(p.sheenColorMapUv),c.push(p.sheenRoughnessMapUv),c.push(p.specularMapUv),c.push(p.specularColorMapUv),c.push(p.specularIntensityMapUv),c.push(p.transmissionMapUv),c.push(p.thicknessMapUv),c.push(p.combine),c.push(p.fogExp2),c.push(p.sizeAttenuation),c.push(p.morphTargetsCount),c.push(p.morphAttributeCount),c.push(p.numDirLights),c.push(p.numPointLights),c.push(p.numSpotLights),c.push(p.numSpotLightMaps),c.push(p.numHemiLights),c.push(p.numRectAreaLights),c.push(p.numDirLightShadows),c.push(p.numPointLightShadows),c.push(p.numSpotLightShadows),c.push(p.numSpotLightShadowsWithMaps),c.push(p.numLightProbes),c.push(p.shadowMapType),c.push(p.toneMapping),c.push(p.numClippingPlanes),c.push(p.numClipIntersection),c.push(p.depthPacking)}function M(c,p){d.disableAll(),p.instancing&&d.enable(0),p.instancingColor&&d.enable(1),p.instancingMorph&&d.enable(2),p.matcap&&d.enable(3),p.envMap&&d.enable(4),p.normalMapObjectSpace&&d.enable(5),p.normalMapTangentSpace&&d.enable(6),p.clearcoat&&d.enable(7),p.iridescence&&d.enable(8),p.alphaTest&&d.enable(9),p.vertexColors&&d.enable(10),p.vertexAlphas&&d.enable(11),p.vertexUv1s&&d.enable(12),p.vertexUv2s&&d.enable(13),p.vertexUv3s&&d.enable(14),p.vertexTangents&&d.enable(15),p.anisotropy&&d.enable(16),p.alphaHash&&d.enable(17),p.batching&&d.enable(18),p.dispersion&&d.enable(19),p.batchingColor&&d.enable(20),p.gradientMap&&d.enable(21),c.push(d.mask),d.disableAll(),p.fog&&d.enable(0),p.useFog&&d.enable(1),p.flatShading&&d.enable(2),p.logarithmicDepthBuffer&&d.enable(3),p.reversedDepthBuffer&&d.enable(4),p.skinning&&d.enable(5),p.morphTargets&&d.enable(6),p.morphNormals&&d.enable(7),p.morphColors&&d.enable(8),p.premultipliedAlpha&&d.enable(9),p.shadowMapEnabled&&d.enable(10),p.doubleSided&&d.enable(11),p.flipSided&&d.enable(12),p.useDepthPacking&&d.enable(13),p.dithering&&d.enable(14),p.transmission&&d.enable(15),p.sheen&&d.enable(16),p.opaque&&d.enable(17),p.pointsUvs&&d.enable(18),p.decodeVideoTexture&&d.enable(19),p.decodeVideoTextureEmissive&&d.enable(20),p.alphaToCoverage&&d.enable(21),c.push(d.mask)}function A(c){let p=O[c.type],L;if(p){let k=Ct[p];L=Na.clone(k.uniforms)}else L=c.uniforms;return L}function C(c,p){let L=g.get(p);return L!==void 0?++L.usedTimes:(L=new Hf(e,p,c,a),w.push(L),g.set(p,L)),L}function T(c){if(--c.usedTimes===0){let p=w.indexOf(c);w[p]=w[w.length-1],w.pop(),g.delete(c.cacheKey),c.destroy()}}function N(c){b.remove(c)}function q(){b.dispose()}return{getParameters:f,getProgramCacheKey:o,getUniforms:A,acquireProgram:C,releaseProgram:T,releaseShaderCache:N,programs:w,dispose:q}}function Wf(){let e=new WeakMap;function n(h){return e.has(h)}function t(h){let d=e.get(h);return d===void 0&&(d={},e.set(h,d)),d}function i(h){e.delete(h)}function l(h,d,b){e.get(h)[d]=b}function a(){e=new WeakMap}return{has:n,get:t,remove:i,update:l,dispose:a}}function zf(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.material.id!==n.material.id?e.material.id-n.material.id:e.z!==n.z?e.z-n.z:e.id-n.id}function so(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.z!==n.z?n.z-e.z:e.id-n.id}function lo(){let e=[],n=0,t=[],i=[],l=[];function a(){n=0,t.length=0,i.length=0,l.length=0}function h(g,S,R,O,U,f){let o=e[n];return o===void 0?(o={id:g.id,object:g,geometry:S,material:R,groupOrder:O,renderOrder:g.renderOrder,z:U,group:f},e[n]=o):(o.id=g.id,o.object=g,o.geometry=S,o.material=R,o.groupOrder=O,o.renderOrder=g.renderOrder,o.z=U,o.group=f),n++,o}function d(g,S,R,O,U,f){let o=h(g,S,R,O,U,f);R.transmission>0?i.push(o):R.transparent===!0?l.push(o):t.push(o)}function b(g,S,R,O,U,f){let o=h(g,S,R,O,U,f);R.transmission>0?i.unshift(o):R.transparent===!0?l.unshift(o):t.unshift(o)}function x(g,S){t.length>1&&t.sort(g||zf),i.length>1&&i.sort(S||so),l.length>1&&l.sort(S||so)}function w(){for(let g=n,S=e.length;g<S;g++){let R=e[g];if(R.id===null)break;R.id=null,R.object=null,R.geometry=null,R.material=null,R.group=null}}return{opaque:t,transmissive:i,transparent:l,init:a,push:d,unshift:b,finish:w,sort:x}}function Xf(){let e=new WeakMap;function n(i,l){let a=e.get(i),h;return a===void 0?(h=new lo,e.set(i,[h])):l>=a.length?(h=new lo,a.push(h)):h=a[l],h}function t(){e=new WeakMap}return{get:n,dispose:t}}function Yf(){let e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={direction:new Oe,color:new Je};break;case"SpotLight":t={position:new Oe,direction:new Oe,color:new Je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Oe,color:new Je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Oe,skyColor:new Je,groundColor:new Je};break;case"RectAreaLight":t={color:new Je,position:new Oe,halfWidth:new Oe,halfHeight:new Oe};break}return e[n.id]=t,t}}}function qf(){let e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ft,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[n.id]=t,t}}}var Kf=0;function $f(e,n){return(n.castShadow?2:0)-(e.castShadow?2:0)+(n.map?1:0)-(e.map?1:0)}function Zf(e){let n=new Yf,t=qf(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let x=0;x<9;x++)i.probe.push(new Oe);let l=new Oe,a=new Wt,h=new Wt;function d(x){let w=0,g=0,S=0;for(let c=0;c<9;c++)i.probe[c].set(0,0,0);let R=0,O=0,U=0,f=0,o=0,P=0,M=0,A=0,C=0,T=0,N=0;x.sort($f);for(let c=0,p=x.length;c<p;c++){let L=x[c],k=L.color,G=L.intensity,z=L.distance,K=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===en?K=L.shadow.map.texture:K=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)w+=k.r*G,g+=k.g*G,S+=k.b*G;else if(L.isLightProbe){for(let B=0;B<9;B++)i.probe[B].addScaledVector(L.sh.coefficients[B],G);N++}else if(L.isDirectionalLight){let B=n.get(L);if(B.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let V=L.shadow,J=t.get(L);J.shadowIntensity=V.intensity,J.shadowBias=V.bias,J.shadowNormalBias=V.normalBias,J.shadowRadius=V.radius,J.shadowMapSize=V.mapSize,i.directionalShadow[R]=J,i.directionalShadowMap[R]=K,i.directionalShadowMatrix[R]=L.shadow.matrix,P++}i.directional[R]=B,R++}else if(L.isSpotLight){let B=n.get(L);B.position.setFromMatrixPosition(L.matrixWorld),B.color.copy(k).multiplyScalar(G),B.distance=z,B.coneCos=Math.cos(L.angle),B.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),B.decay=L.decay,i.spot[U]=B;let V=L.shadow;if(L.map&&(i.spotLightMap[C]=L.map,C++,V.updateMatrices(L),L.castShadow&&T++),i.spotLightMatrix[U]=V.matrix,L.castShadow){let J=t.get(L);J.shadowIntensity=V.intensity,J.shadowBias=V.bias,J.shadowNormalBias=V.normalBias,J.shadowRadius=V.radius,J.shadowMapSize=V.mapSize,i.spotShadow[U]=J,i.spotShadowMap[U]=K,A++}U++}else if(L.isRectAreaLight){let B=n.get(L);B.color.copy(k).multiplyScalar(G),B.halfWidth.set(L.width*.5,0,0),B.halfHeight.set(0,L.height*.5,0),i.rectArea[f]=B,f++}else if(L.isPointLight){let B=n.get(L);if(B.color.copy(L.color).multiplyScalar(L.intensity),B.distance=L.distance,B.decay=L.decay,L.castShadow){let V=L.shadow,J=t.get(L);J.shadowIntensity=V.intensity,J.shadowBias=V.bias,J.shadowNormalBias=V.normalBias,J.shadowRadius=V.radius,J.shadowMapSize=V.mapSize,J.shadowCameraNear=V.camera.near,J.shadowCameraFar=V.camera.far,i.pointShadow[O]=J,i.pointShadowMap[O]=K,i.pointShadowMatrix[O]=L.shadow.matrix,M++}i.point[O]=B,O++}else if(L.isHemisphereLight){let B=n.get(L);B.skyColor.copy(L.color).multiplyScalar(G),B.groundColor.copy(L.groundColor).multiplyScalar(G),i.hemi[o]=B,o++}}f>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ae.LTC_FLOAT_1,i.rectAreaLTC2=ae.LTC_FLOAT_2):(i.rectAreaLTC1=ae.LTC_HALF_1,i.rectAreaLTC2=ae.LTC_HALF_2)),i.ambient[0]=w,i.ambient[1]=g,i.ambient[2]=S;let q=i.hash;(q.directionalLength!==R||q.pointLength!==O||q.spotLength!==U||q.rectAreaLength!==f||q.hemiLength!==o||q.numDirectionalShadows!==P||q.numPointShadows!==M||q.numSpotShadows!==A||q.numSpotMaps!==C||q.numLightProbes!==N)&&(i.directional.length=R,i.spot.length=U,i.rectArea.length=f,i.point.length=O,i.hemi.length=o,i.directionalShadow.length=P,i.directionalShadowMap.length=P,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=A,i.spotShadowMap.length=A,i.directionalShadowMatrix.length=P,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=A+C-T,i.spotLightMap.length=C,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=N,q.directionalLength=R,q.pointLength=O,q.spotLength=U,q.rectAreaLength=f,q.hemiLength=o,q.numDirectionalShadows=P,q.numPointShadows=M,q.numSpotShadows=A,q.numSpotMaps=C,q.numLightProbes=N,i.version=Kf++)}function b(x,w){let g=0,S=0,R=0,O=0,U=0,f=w.matrixWorldInverse;for(let o=0,P=x.length;o<P;o++){let M=x[o];if(M.isDirectionalLight){let A=i.directional[g];A.direction.setFromMatrixPosition(M.matrixWorld),l.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(l),A.direction.transformDirection(f),g++}else if(M.isSpotLight){let A=i.spot[R];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(f),A.direction.setFromMatrixPosition(M.matrixWorld),l.setFromMatrixPosition(M.target.matrixWorld),A.direction.sub(l),A.direction.transformDirection(f),R++}else if(M.isRectAreaLight){let A=i.rectArea[O];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(f),h.identity(),a.copy(M.matrixWorld),a.premultiply(f),h.extractRotation(a),A.halfWidth.set(M.width*.5,0,0),A.halfHeight.set(0,M.height*.5,0),A.halfWidth.applyMatrix4(h),A.halfHeight.applyMatrix4(h),O++}else if(M.isPointLight){let A=i.point[S];A.position.setFromMatrixPosition(M.matrixWorld),A.position.applyMatrix4(f),S++}else if(M.isHemisphereLight){let A=i.hemi[U];A.direction.setFromMatrixPosition(M.matrixWorld),A.direction.transformDirection(f),U++}}}return{setup:d,setupView:b,state:i}}function co(e){let n=new Zf(e),t=[],i=[];function l(w){x.camera=w,t.length=0,i.length=0}function a(w){t.push(w)}function h(w){i.push(w)}function d(){n.setup(t)}function b(w){n.setupView(t,w)}let x={lightsArray:t,shadowsArray:i,camera:null,lights:n,transmissionRenderTarget:{}};return{init:l,state:x,setupLights:d,setupLightsView:b,pushLight:a,pushShadow:h}}function Qf(e){let n=new WeakMap;function t(l,a=0){let h=n.get(l),d;return h===void 0?(d=new co(e),n.set(l,[d])):a>=h.length?(d=new co(e),h.push(d)):d=h[a],d}function i(){n=new WeakMap}return{get:t,dispose:i}}var Jf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ed=[new Oe(1,0,0),new Oe(-1,0,0),new Oe(0,1,0),new Oe(0,-1,0),new Oe(0,0,1),new Oe(0,0,-1)],td=[new Oe(0,-1,0),new Oe(0,-1,0),new Oe(0,0,1),new Oe(0,0,-1),new Oe(0,-1,0),new Oe(0,-1,0)],fo=new Wt,vn=new Oe,dr=new Oe;function nd(e,n,t){let i=new tr,l=new ft,a=new ft,h=new dt,d=new Ha,b=new Va,x={},w=t.maxTextureSize,g={[$t]:gt,[gt]:$t,[Tt]:Tt},S=new It({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ft},radius:{value:4}},vertexShader:Jf,fragmentShader:jf}),R=S.clone();R.defines.HORIZONTAL_PASS=1;let O=new hn;O.setAttribute("position",new pn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let U=new wt(O,S),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=on;let o=this.type;this.render=function(T,N,q){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||T.length===0)return;T.type===Ir&&(ze("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),T.type=on);let c=e.getRenderTarget(),p=e.getActiveCubeFace(),L=e.getActiveMipmapLevel(),k=e.state;k.setBlending(Lt),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);let G=o!==this.type;G&&N.traverse(function(z){z.material&&(Array.isArray(z.material)?z.material.forEach(K=>K.needsUpdate=!0):z.material.needsUpdate=!0)});for(let z=0,K=T.length;z<K;z++){let B=T[z],V=B.shadow;if(V===void 0){ze("WebGLShadowMap:",B,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;l.copy(V.mapSize);let J=V.getFrameExtents();if(l.multiply(J),a.copy(V.mapSize),(l.x>w||l.y>w)&&(l.x>w&&(a.x=Math.floor(w/J.x),l.x=a.x*J.x,V.mapSize.x=a.x),l.y>w&&(a.y=Math.floor(w/J.y),l.y=a.y*J.y,V.mapSize.y=a.y)),V.map===null||G===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Kt){if(B.isPointLight){ze("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new Rt(l.x,l.y,{format:en,type:Ut,minFilter:vt,magFilter:vt,generateMipmaps:!1}),V.map.texture.name=B.name+".shadowMap",V.map.depthTexture=new _n(l.x,l.y,Dt),V.map.depthTexture.name=B.name+".shadowMapDepth",V.map.depthTexture.format=Ht,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Nt,V.map.depthTexture.magFilter=Nt}else{B.isPointLight?(V.map=new er(l.x),V.map.depthTexture=new Ba(l.x,yt)):(V.map=new Rt(l.x,l.y),V.map.depthTexture=new _n(l.x,l.y,yt)),V.map.depthTexture.name=B.name+".shadowMap",V.map.depthTexture.format=Ht;let ge=e.state.buffers.depth.getReversed();this.type===on?(V.map.depthTexture.compareFunction=ge?Bn:On,V.map.depthTexture.minFilter=vt,V.map.depthTexture.magFilter=vt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Nt,V.map.depthTexture.magFilter=Nt)}V.camera.updateProjectionMatrix()}let xe=V.map.isWebGLCubeRenderTarget?6:1;for(let ge=0;ge<xe;ge++){if(V.map.isWebGLCubeRenderTarget)e.setRenderTarget(V.map,ge),e.clear();else{ge===0&&(e.setRenderTarget(V.map),e.clear());let Ee=V.getViewport(ge);h.set(a.x*Ee.x,a.y*Ee.y,a.x*Ee.z,a.y*Ee.w),k.viewport(h)}if(B.isPointLight){let Ee=V.camera,Be=V.matrix,we=B.distance||Ee.far;we!==Ee.far&&(Ee.far=we,Ee.updateProjectionMatrix()),vn.setFromMatrixPosition(B.matrixWorld),Ee.position.copy(vn),dr.copy(Ee.position),dr.add(ed[ge]),Ee.up.copy(td[ge]),Ee.lookAt(dr),Ee.updateMatrixWorld(),Be.makeTranslation(-vn.x,-vn.y,-vn.z),fo.multiplyMatrices(Ee.projectionMatrix,Ee.matrixWorldInverse),V._frustum.setFromProjectionMatrix(fo,Ee.coordinateSystem,Ee.reversedDepth)}else V.updateMatrices(B);i=V.getFrustum(),A(N,q,V.camera,B,this.type)}V.isPointLightShadow!==!0&&this.type===Kt&&P(V,q),V.needsUpdate=!1}o=this.type,f.needsUpdate=!1,e.setRenderTarget(c,p,L)};function P(T,N){let q=n.update(U);S.defines.VSM_SAMPLES!==T.blurSamples&&(S.defines.VSM_SAMPLES=T.blurSamples,R.defines.VSM_SAMPLES=T.blurSamples,S.needsUpdate=!0,R.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Rt(l.x,l.y,{format:en,type:Ut})),S.uniforms.shadow_pass.value=T.map.depthTexture,S.uniforms.resolution.value=T.mapSize,S.uniforms.radius.value=T.radius,e.setRenderTarget(T.mapPass),e.clear(),e.renderBufferDirect(N,null,q,S,U,null),R.uniforms.shadow_pass.value=T.mapPass.texture,R.uniforms.resolution.value=T.mapSize,R.uniforms.radius.value=T.radius,e.setRenderTarget(T.map),e.clear(),e.renderBufferDirect(N,null,q,R,U,null)}function M(T,N,q,c){let p=null,L=q.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)p=L;else if(p=q.isPointLight===!0?b:d,e.localClippingEnabled&&N.clipShadows===!0&&Array.isArray(N.clippingPlanes)&&N.clippingPlanes.length!==0||N.displacementMap&&N.displacementScale!==0||N.alphaMap&&N.alphaTest>0||N.map&&N.alphaTest>0||N.alphaToCoverage===!0){let k=p.uuid,G=N.uuid,z=x[k];z===void 0&&(z={},x[k]=z);let K=z[G];K===void 0&&(K=p.clone(),z[G]=K,N.addEventListener("dispose",C)),p=K}if(p.visible=N.visible,p.wireframe=N.wireframe,c===Kt?p.side=N.shadowSide!==null?N.shadowSide:N.side:p.side=N.shadowSide!==null?N.shadowSide:g[N.side],p.alphaMap=N.alphaMap,p.alphaTest=N.alphaToCoverage===!0?.5:N.alphaTest,p.map=N.map,p.clipShadows=N.clipShadows,p.clippingPlanes=N.clippingPlanes,p.clipIntersection=N.clipIntersection,p.displacementMap=N.displacementMap,p.displacementScale=N.displacementScale,p.displacementBias=N.displacementBias,p.wireframeLinewidth=N.wireframeLinewidth,p.linewidth=N.linewidth,q.isPointLight===!0&&p.isMeshDistanceMaterial===!0){let k=e.properties.get(p);k.light=q}return p}function A(T,N,q,c,p){if(T.visible===!1)return;if(T.layers.test(N.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&p===Kt)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,T.matrixWorld);let G=n.update(T),z=T.material;if(Array.isArray(z)){let K=G.groups;for(let B=0,V=K.length;B<V;B++){let J=K[B],xe=z[J.materialIndex];if(xe&&xe.visible){let ge=M(T,xe,c,p);T.onBeforeShadow(e,T,N,q,G,ge,J),e.renderBufferDirect(q,null,G,ge,T,J),T.onAfterShadow(e,T,N,q,G,ge,J)}}}else if(z.visible){let K=M(T,z,c,p);T.onBeforeShadow(e,T,N,q,G,K,null),e.renderBufferDirect(q,null,G,K,T,null),T.onAfterShadow(e,T,N,q,G,K,null)}}let k=T.children;for(let G=0,z=k.length;G<z;G++)A(k[G],N,q,c,p)}function C(T){T.target.removeEventListener("dispose",C);for(let q in x){let c=x[q],p=T.target.uuid;p in c&&(c[p].dispose(),delete c[p])}}}var id={[Mn]:Tn,[An]:Cn,[Rn]:Pn,[ln]:bn,[Tn]:Mn,[Cn]:An,[Pn]:Rn,[bn]:ln};function rd(e,n){function t(){let _=!1,se=new dt,j=null,le=new dt(0,0,0,0);return{setMask:function(Z){j!==Z&&!_&&(e.colorMask(Z,Z,Z,Z),j=Z)},setLocked:function(Z){_=Z},setClear:function(Z,X,ee,be,$e){$e===!0&&(Z*=be,X*=be,ee*=be),se.set(Z,X,ee,be),le.equals(se)===!1&&(e.clearColor(Z,X,ee,be),le.copy(se))},reset:function(){_=!1,j=null,le.set(-1,0,0,0)}}}function i(){let _=!1,se=!1,j=null,le=null,Z=null;return{setReversed:function(X){if(se!==X){let ee=n.get("EXT_clip_control");X?ee.clipControlEXT(ee.LOWER_LEFT_EXT,ee.ZERO_TO_ONE_EXT):ee.clipControlEXT(ee.LOWER_LEFT_EXT,ee.NEGATIVE_ONE_TO_ONE_EXT),se=X;let be=Z;Z=null,this.setClear(be)}},getReversed:function(){return se},setTest:function(X){X?$(e.DEPTH_TEST):fe(e.DEPTH_TEST)},setMask:function(X){j!==X&&!_&&(e.depthMask(X),j=X)},setFunc:function(X){if(se&&(X=id[X]),le!==X){switch(X){case Mn:e.depthFunc(e.NEVER);break;case Tn:e.depthFunc(e.ALWAYS);break;case An:e.depthFunc(e.LESS);break;case ln:e.depthFunc(e.LEQUAL);break;case Rn:e.depthFunc(e.EQUAL);break;case bn:e.depthFunc(e.GEQUAL);break;case Cn:e.depthFunc(e.GREATER);break;case Pn:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}le=X}},setLocked:function(X){_=X},setClear:function(X){Z!==X&&(se&&(X=1-X),e.clearDepth(X),Z=X)},reset:function(){_=!1,j=null,le=null,Z=null,se=!1}}}function l(){let _=!1,se=null,j=null,le=null,Z=null,X=null,ee=null,be=null,$e=null;return{setTest:function(Ve){_||(Ve?$(e.STENCIL_TEST):fe(e.STENCIL_TEST))},setMask:function(Ve){se!==Ve&&!_&&(e.stencilMask(Ve),se=Ve)},setFunc:function(Ve,Mt,Pt){(j!==Ve||le!==Mt||Z!==Pt)&&(e.stencilFunc(Ve,Mt,Pt),j=Ve,le=Mt,Z=Pt)},setOp:function(Ve,Mt,Pt){(X!==Ve||ee!==Mt||be!==Pt)&&(e.stencilOp(Ve,Mt,Pt),X=Ve,ee=Mt,be=Pt)},setLocked:function(Ve){_=Ve},setClear:function(Ve){$e!==Ve&&(e.clearStencil(Ve),$e=Ve)},reset:function(){_=!1,se=null,j=null,le=null,Z=null,X=null,ee=null,be=null,$e=null}}}let a=new t,h=new i,d=new l,b=new WeakMap,x=new WeakMap,w={},g={},S=new WeakMap,R=[],O=null,U=!1,f=null,o=null,P=null,M=null,A=null,C=null,T=null,N=new Je(0,0,0),q=0,c=!1,p=null,L=null,k=null,G=null,z=null,K=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),B=!1,V=0,J=e.getParameter(e.VERSION);J.indexOf("WebGL")!==-1?(V=parseFloat(/^WebGL (\d)/.exec(J)[1]),B=V>=1):J.indexOf("OpenGL ES")!==-1&&(V=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),B=V>=2);let xe=null,ge={},Ee=e.getParameter(e.SCISSOR_BOX),Be=e.getParameter(e.VIEWPORT),we=new dt().fromArray(Ee),it=new dt().fromArray(Be);function je(_,se,j,le){let Z=new Uint8Array(4),X=e.createTexture();e.bindTexture(_,X),e.texParameteri(_,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(_,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let ee=0;ee<j;ee++)_===e.TEXTURE_3D||_===e.TEXTURE_2D_ARRAY?e.texImage3D(se,0,e.RGBA,1,1,le,0,e.RGBA,e.UNSIGNED_BYTE,Z):e.texImage2D(se+ee,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Z);return X}let W={};W[e.TEXTURE_2D]=je(e.TEXTURE_2D,e.TEXTURE_2D,1),W[e.TEXTURE_CUBE_MAP]=je(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),W[e.TEXTURE_2D_ARRAY]=je(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),W[e.TEXTURE_3D]=je(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),h.setClear(1),d.setClear(0),$(e.DEPTH_TEST),h.setFunc(ln),Le(!1),rt($n),$(e.CULL_FACE),He(Lt);function $(_){w[_]!==!0&&(e.enable(_),w[_]=!0)}function fe(_){w[_]!==!1&&(e.disable(_),w[_]=!1)}function Ce(_,se){return g[_]!==se?(e.bindFramebuffer(_,se),g[_]=se,_===e.DRAW_FRAMEBUFFER&&(g[e.FRAMEBUFFER]=se),_===e.FRAMEBUFFER&&(g[e.DRAW_FRAMEBUFFER]=se),!0):!1}function pe(_,se){let j=R,le=!1;if(_){j=S.get(se),j===void 0&&(j=[],S.set(se,j));let Z=_.textures;if(j.length!==Z.length||j[0]!==e.COLOR_ATTACHMENT0){for(let X=0,ee=Z.length;X<ee;X++)j[X]=e.COLOR_ATTACHMENT0+X;j.length=Z.length,le=!0}}else j[0]!==e.BACK&&(j[0]=e.BACK,le=!0);le&&e.drawBuffers(j)}function ye(_){return O!==_?(e.useProgram(_),O=_,!0):!1}let lt={[Zt]:e.FUNC_ADD,[yr]:e.FUNC_SUBTRACT,[Fr]:e.FUNC_REVERSE_SUBTRACT};lt[Or]=e.MIN,lt[Br]=e.MAX;let Ie={[Gr]:e.ZERO,[Hr]:e.ONE,[Vr]:e.SRC_COLOR,[Wr]:e.SRC_ALPHA,[$r]:e.SRC_ALPHA_SATURATE,[qr]:e.DST_COLOR,[Xr]:e.DST_ALPHA,[kr]:e.ONE_MINUS_SRC_COLOR,[zr]:e.ONE_MINUS_SRC_ALPHA,[Kr]:e.ONE_MINUS_DST_COLOR,[Yr]:e.ONE_MINUS_DST_ALPHA,[Zr]:e.CONSTANT_COLOR,[Qr]:e.ONE_MINUS_CONSTANT_COLOR,[Jr]:e.CONSTANT_ALPHA,[jr]:e.ONE_MINUS_CONSTANT_ALPHA};function He(_,se,j,le,Z,X,ee,be,$e,Ve){if(_===Lt){U===!0&&(fe(e.BLEND),U=!1);return}if(U===!1&&($(e.BLEND),U=!0),_!==Nr){if(_!==f||Ve!==c){if((o!==Zt||A!==Zt)&&(e.blendEquation(e.FUNC_ADD),o=Zt,A=Zt),Ve)switch(_){case sn:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Zn:e.blendFunc(e.ONE,e.ONE);break;case Qn:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Jn:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Qe("WebGLState: Invalid blending: ",_);break}else switch(_){case sn:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Zn:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case Qn:Qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Jn:Qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qe("WebGLState: Invalid blending: ",_);break}P=null,M=null,C=null,T=null,N.set(0,0,0),q=0,f=_,c=Ve}return}Z=Z||se,X=X||j,ee=ee||le,(se!==o||Z!==A)&&(e.blendEquationSeparate(lt[se],lt[Z]),o=se,A=Z),(j!==P||le!==M||X!==C||ee!==T)&&(e.blendFuncSeparate(Ie[j],Ie[le],Ie[X],Ie[ee]),P=j,M=le,C=X,T=ee),(be.equals(N)===!1||$e!==q)&&(e.blendColor(be.r,be.g,be.b,$e),N.copy(be),q=$e),f=_,c=!1}function Xe(_,se){_.side===Tt?fe(e.CULL_FACE):$(e.CULL_FACE);let j=_.side===gt;se&&(j=!j),Le(j),_.blending===sn&&_.transparent===!1?He(Lt):He(_.blending,_.blendEquation,_.blendSrc,_.blendDst,_.blendEquationAlpha,_.blendSrcAlpha,_.blendDstAlpha,_.blendColor,_.blendAlpha,_.premultipliedAlpha),h.setFunc(_.depthFunc),h.setTest(_.depthTest),h.setMask(_.depthWrite),a.setMask(_.colorWrite);let le=_.stencilWrite;d.setTest(le),le&&(d.setMask(_.stencilWriteMask),d.setFunc(_.stencilFunc,_.stencilRef,_.stencilFuncMask),d.setOp(_.stencilFail,_.stencilZFail,_.stencilZPass)),at(_.polygonOffset,_.polygonOffsetFactor,_.polygonOffsetUnits),_.alphaToCoverage===!0?$(e.SAMPLE_ALPHA_TO_COVERAGE):fe(e.SAMPLE_ALPHA_TO_COVERAGE)}function Le(_){p!==_&&(_?e.frontFace(e.CW):e.frontFace(e.CCW),p=_)}function rt(_){_!==Ur?($(e.CULL_FACE),_!==L&&(_===$n?e.cullFace(e.BACK):_===wr?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):fe(e.CULL_FACE),L=_}function m(_){_!==k&&(B&&e.lineWidth(_),k=_)}function at(_,se,j){_?($(e.POLYGON_OFFSET_FILL),(G!==se||z!==j)&&(e.polygonOffset(se,j),G=se,z=j)):fe(e.POLYGON_OFFSET_FILL)}function Ge(_){_?$(e.SCISSOR_TEST):fe(e.SCISSOR_TEST)}function Ke(_){_===void 0&&(_=e.TEXTURE0+K-1),xe!==_&&(e.activeTexture(_),xe=_)}function me(_,se,j){j===void 0&&(xe===null?j=e.TEXTURE0+K-1:j=xe);let le=ge[j];le===void 0&&(le={type:void 0,texture:void 0},ge[j]=le),(le.type!==_||le.texture!==se)&&(xe!==j&&(e.activeTexture(j),xe=j),e.bindTexture(_,se||W[_]),le.type=_,le.texture=se)}function u(){let _=ge[xe];_!==void 0&&_.type!==void 0&&(e.bindTexture(_.type,null),_.type=void 0,_.texture=void 0)}function r(){try{e.compressedTexImage2D(...arguments)}catch(_){Qe("WebGLState:",_)}}function v(){try{e.compressedTexImage3D(...arguments)}catch(_){Qe("WebGLState:",_)}}function H(){try{e.texSubImage2D(...arguments)}catch(_){Qe("WebGLState:",_)}}function Y(){try{e.texSubImage3D(...arguments)}catch(_){Qe("WebGLState:",_)}}function F(){try{e.compressedTexSubImage2D(...arguments)}catch(_){Qe("WebGLState:",_)}}function ve(){try{e.compressedTexSubImage3D(...arguments)}catch(_){Qe("WebGLState:",_)}}function te(){try{e.texStorage2D(...arguments)}catch(_){Qe("WebGLState:",_)}}function he(){try{e.texStorage3D(...arguments)}catch(_){Qe("WebGLState:",_)}}function Re(){try{e.texImage2D(...arguments)}catch(_){Qe("WebGLState:",_)}}function Q(){try{e.texImage3D(...arguments)}catch(_){Qe("WebGLState:",_)}}function ie(_){we.equals(_)===!1&&(e.scissor(_.x,_.y,_.z,_.w),we.copy(_))}function ue(_){it.equals(_)===!1&&(e.viewport(_.x,_.y,_.z,_.w),it.copy(_))}function _e(_,se){let j=x.get(se);j===void 0&&(j=new WeakMap,x.set(se,j));let le=j.get(_);le===void 0&&(le=e.getUniformBlockIndex(se,_.name),j.set(_,le))}function ne(_,se){let le=x.get(se).get(_);b.get(se)!==le&&(e.uniformBlockBinding(se,le,_.__bindingPointIndex),b.set(se,le))}function De(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),h.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),w={},xe=null,ge={},g={},S=new WeakMap,R=[],O=null,U=!1,f=null,o=null,P=null,M=null,A=null,C=null,T=null,N=new Je(0,0,0),q=0,c=!1,p=null,L=null,k=null,G=null,z=null,we.set(0,0,e.canvas.width,e.canvas.height),it.set(0,0,e.canvas.width,e.canvas.height),a.reset(),h.reset(),d.reset()}return{buffers:{color:a,depth:h,stencil:d},enable:$,disable:fe,bindFramebuffer:Ce,drawBuffers:pe,useProgram:ye,setBlending:He,setMaterial:Xe,setFlipSided:Le,setCullFace:rt,setLineWidth:m,setPolygonOffset:at,setScissorTest:Ge,activeTexture:Ke,bindTexture:me,unbindTexture:u,compressedTexImage2D:r,compressedTexImage3D:v,texImage2D:Re,texImage3D:Q,updateUBOMapping:_e,uniformBlockBinding:ne,texStorage2D:te,texStorage3D:he,texSubImage2D:H,texSubImage3D:Y,compressedTexSubImage2D:F,compressedTexSubImage3D:ve,scissor:ie,viewport:ue,reset:De}}function ad(e,n,t,i,l,a,h){let d=n.has("WEBGL_multisampled_render_to_texture")?n.get("WEBGL_multisampled_render_to_texture"):null,b=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),x=new ft,w=new WeakMap,g,S=new WeakMap,R=!1;try{R=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function O(u,r){return R?new OffscreenCanvas(u,r):Ta("canvas")}function U(u,r,v){let H=1,Y=me(u);if((Y.width>v||Y.height>v)&&(H=v/Math.max(Y.width,Y.height)),H<1)if(typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&u instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&u instanceof ImageBitmap||typeof VideoFrame<"u"&&u instanceof VideoFrame){let F=Math.floor(H*Y.width),ve=Math.floor(H*Y.height);g===void 0&&(g=O(F,ve));let te=r?O(F,ve):g;return te.width=F,te.height=ve,te.getContext("2d").drawImage(u,0,0,F,ve),ze("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+F+"x"+ve+")."),te}else return"data"in u&&ze("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),u;return u}function f(u){return u.generateMipmaps}function o(u){e.generateMipmap(u)}function P(u){return u.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:u.isWebGL3DRenderTarget?e.TEXTURE_3D:u.isWebGLArrayRenderTarget||u.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function M(u,r,v,H,Y=!1){if(u!==null){if(e[u]!==void 0)return e[u];ze("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+u+"'")}let F=r;if(r===e.RED&&(v===e.FLOAT&&(F=e.R32F),v===e.HALF_FLOAT&&(F=e.R16F),v===e.UNSIGNED_BYTE&&(F=e.R8)),r===e.RED_INTEGER&&(v===e.UNSIGNED_BYTE&&(F=e.R8UI),v===e.UNSIGNED_SHORT&&(F=e.R16UI),v===e.UNSIGNED_INT&&(F=e.R32UI),v===e.BYTE&&(F=e.R8I),v===e.SHORT&&(F=e.R16I),v===e.INT&&(F=e.R32I)),r===e.RG&&(v===e.FLOAT&&(F=e.RG32F),v===e.HALF_FLOAT&&(F=e.RG16F),v===e.UNSIGNED_BYTE&&(F=e.RG8)),r===e.RG_INTEGER&&(v===e.UNSIGNED_BYTE&&(F=e.RG8UI),v===e.UNSIGNED_SHORT&&(F=e.RG16UI),v===e.UNSIGNED_INT&&(F=e.RG32UI),v===e.BYTE&&(F=e.RG8I),v===e.SHORT&&(F=e.RG16I),v===e.INT&&(F=e.RG32I)),r===e.RGB_INTEGER&&(v===e.UNSIGNED_BYTE&&(F=e.RGB8UI),v===e.UNSIGNED_SHORT&&(F=e.RGB16UI),v===e.UNSIGNED_INT&&(F=e.RGB32UI),v===e.BYTE&&(F=e.RGB8I),v===e.SHORT&&(F=e.RGB16I),v===e.INT&&(F=e.RGB32I)),r===e.RGBA_INTEGER&&(v===e.UNSIGNED_BYTE&&(F=e.RGBA8UI),v===e.UNSIGNED_SHORT&&(F=e.RGBA16UI),v===e.UNSIGNED_INT&&(F=e.RGBA32UI),v===e.BYTE&&(F=e.RGBA8I),v===e.SHORT&&(F=e.RGBA16I),v===e.INT&&(F=e.RGBA32I)),r===e.RGB&&(v===e.UNSIGNED_INT_5_9_9_9_REV&&(F=e.RGB9_E5),v===e.UNSIGNED_INT_10F_11F_11F_REV&&(F=e.R11F_G11F_B10F)),r===e.RGBA){let ve=Y?zi:nt.getTransfer(H);v===e.FLOAT&&(F=e.RGBA32F),v===e.HALF_FLOAT&&(F=e.RGBA16F),v===e.UNSIGNED_BYTE&&(F=ve===qe?e.SRGB8_ALPHA8:e.RGBA8),v===e.UNSIGNED_SHORT_4_4_4_4&&(F=e.RGBA4),v===e.UNSIGNED_SHORT_5_5_5_1&&(F=e.RGB5_A1)}return(F===e.R16F||F===e.R32F||F===e.RG16F||F===e.RG32F||F===e.RGBA16F||F===e.RGBA32F)&&n.get("EXT_color_buffer_float"),F}function A(u,r){let v;return u?r===null||r===yt||r===jt?v=e.DEPTH24_STENCIL8:r===Dt?v=e.DEPTH32F_STENCIL8:r===dn&&(v=e.DEPTH24_STENCIL8,ze("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):r===null||r===yt||r===jt?v=e.DEPTH_COMPONENT24:r===Dt?v=e.DEPTH_COMPONENT32F:r===dn&&(v=e.DEPTH_COMPONENT16),v}function C(u,r){return f(u)===!0||u.isFramebufferTexture&&u.minFilter!==Nt&&u.minFilter!==vt?Math.log2(Math.max(r.width,r.height))+1:u.mipmaps!==void 0&&u.mipmaps.length>0?u.mipmaps.length:u.isCompressedTexture&&Array.isArray(u.image)?r.mipmaps.length:1}function T(u){let r=u.target;r.removeEventListener("dispose",T),q(r),r.isVideoTexture&&w.delete(r)}function N(u){let r=u.target;r.removeEventListener("dispose",N),p(r)}function q(u){let r=i.get(u);if(r.__webglInit===void 0)return;let v=u.source,H=S.get(v);if(H){let Y=H[r.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&c(u),Object.keys(H).length===0&&S.delete(v)}i.remove(u)}function c(u){let r=i.get(u);e.deleteTexture(r.__webglTexture);let v=u.source,H=S.get(v);delete H[r.__cacheKey],h.memory.textures--}function p(u){let r=i.get(u);if(u.depthTexture&&(u.depthTexture.dispose(),i.remove(u.depthTexture)),u.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(r.__webglFramebuffer[H]))for(let Y=0;Y<r.__webglFramebuffer[H].length;Y++)e.deleteFramebuffer(r.__webglFramebuffer[H][Y]);else e.deleteFramebuffer(r.__webglFramebuffer[H]);r.__webglDepthbuffer&&e.deleteRenderbuffer(r.__webglDepthbuffer[H])}else{if(Array.isArray(r.__webglFramebuffer))for(let H=0;H<r.__webglFramebuffer.length;H++)e.deleteFramebuffer(r.__webglFramebuffer[H]);else e.deleteFramebuffer(r.__webglFramebuffer);if(r.__webglDepthbuffer&&e.deleteRenderbuffer(r.__webglDepthbuffer),r.__webglMultisampledFramebuffer&&e.deleteFramebuffer(r.__webglMultisampledFramebuffer),r.__webglColorRenderbuffer)for(let H=0;H<r.__webglColorRenderbuffer.length;H++)r.__webglColorRenderbuffer[H]&&e.deleteRenderbuffer(r.__webglColorRenderbuffer[H]);r.__webglDepthRenderbuffer&&e.deleteRenderbuffer(r.__webglDepthRenderbuffer)}let v=u.textures;for(let H=0,Y=v.length;H<Y;H++){let F=i.get(v[H]);F.__webglTexture&&(e.deleteTexture(F.__webglTexture),h.memory.textures--),i.remove(v[H])}i.remove(u)}let L=0;function k(){L=0}function G(){let u=L;return u>=l.maxTextures&&ze("WebGLTextures: Trying to use "+u+" texture units while this GPU supports only "+l.maxTextures),L+=1,u}function z(u){let r=[];return r.push(u.wrapS),r.push(u.wrapT),r.push(u.wrapR||0),r.push(u.magFilter),r.push(u.minFilter),r.push(u.anisotropy),r.push(u.internalFormat),r.push(u.format),r.push(u.type),r.push(u.generateMipmaps),r.push(u.premultiplyAlpha),r.push(u.flipY),r.push(u.unpackAlignment),r.push(u.colorSpace),r.join()}function K(u,r){let v=i.get(u);if(u.isVideoTexture&&Ge(u),u.isRenderTargetTexture===!1&&u.isExternalTexture!==!0&&u.version>0&&v.__version!==u.version){let H=u.image;if(H===null)ze("WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)ze("WebGLRenderer: Texture marked for update but image is incomplete");else{W(v,u,r);return}}else u.isExternalTexture&&(v.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D,v.__webglTexture,e.TEXTURE0+r)}function B(u,r){let v=i.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&v.__version!==u.version){W(v,u,r);return}else u.isExternalTexture&&(v.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D_ARRAY,v.__webglTexture,e.TEXTURE0+r)}function V(u,r){let v=i.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&v.__version!==u.version){W(v,u,r);return}t.bindTexture(e.TEXTURE_3D,v.__webglTexture,e.TEXTURE0+r)}function J(u,r){let v=i.get(u);if(u.isCubeDepthTexture!==!0&&u.version>0&&v.__version!==u.version){$(v,u,r);return}t.bindTexture(e.TEXTURE_CUBE_MAP,v.__webglTexture,e.TEXTURE0+r)}let xe={[ia]:e.REPEAT,[Un]:e.CLAMP_TO_EDGE,[ra]:e.MIRRORED_REPEAT},ge={[Nt]:e.NEAREST,[aa]:e.NEAREST_MIPMAP_NEAREST,[fn]:e.NEAREST_MIPMAP_LINEAR,[vt]:e.LINEAR,[wn]:e.LINEAR_MIPMAP_NEAREST,[Jt]:e.LINEAR_MIPMAP_LINEAR},Ee={[_a]:e.NEVER,[xa]:e.ALWAYS,[ga]:e.LESS,[On]:e.LEQUAL,[va]:e.EQUAL,[Bn]:e.GEQUAL,[Sa]:e.GREATER,[Ea]:e.NOTEQUAL};function Be(u,r){if(r.type===Dt&&n.has("OES_texture_float_linear")===!1&&(r.magFilter===vt||r.magFilter===wn||r.magFilter===fn||r.magFilter===Jt||r.minFilter===vt||r.minFilter===wn||r.minFilter===fn||r.minFilter===Jt)&&ze("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(u,e.TEXTURE_WRAP_S,xe[r.wrapS]),e.texParameteri(u,e.TEXTURE_WRAP_T,xe[r.wrapT]),(u===e.TEXTURE_3D||u===e.TEXTURE_2D_ARRAY)&&e.texParameteri(u,e.TEXTURE_WRAP_R,xe[r.wrapR]),e.texParameteri(u,e.TEXTURE_MAG_FILTER,ge[r.magFilter]),e.texParameteri(u,e.TEXTURE_MIN_FILTER,ge[r.minFilter]),r.compareFunction&&(e.texParameteri(u,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(u,e.TEXTURE_COMPARE_FUNC,Ee[r.compareFunction])),n.has("EXT_texture_filter_anisotropic")===!0){if(r.magFilter===Nt||r.minFilter!==fn&&r.minFilter!==Jt||r.type===Dt&&n.has("OES_texture_float_linear")===!1)return;if(r.anisotropy>1||i.get(r).__currentAnisotropy){let v=n.get("EXT_texture_filter_anisotropic");e.texParameterf(u,v.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(r.anisotropy,l.getMaxAnisotropy())),i.get(r).__currentAnisotropy=r.anisotropy}}}function we(u,r){let v=!1;u.__webglInit===void 0&&(u.__webglInit=!0,r.addEventListener("dispose",T));let H=r.source,Y=S.get(H);Y===void 0&&(Y={},S.set(H,Y));let F=z(r);if(F!==u.__cacheKey){Y[F]===void 0&&(Y[F]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,v=!0),Y[F].usedTimes++;let ve=Y[u.__cacheKey];ve!==void 0&&(Y[u.__cacheKey].usedTimes--,ve.usedTimes===0&&c(r)),u.__cacheKey=F,u.__webglTexture=Y[F].texture}return v}function it(u,r,v){return Math.floor(Math.floor(u/v)/r)}function je(u,r,v,H){let F=u.updateRanges;if(F.length===0)t.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,v,H,r.data);else{F.sort((Q,ie)=>Q.start-ie.start);let ve=0;for(let Q=1;Q<F.length;Q++){let ie=F[ve],ue=F[Q],_e=ie.start+ie.count,ne=it(ue.start,r.width,4),De=it(ie.start,r.width,4);ue.start<=_e+1&&ne===De&&it(ue.start+ue.count-1,r.width,4)===ne?ie.count=Math.max(ie.count,ue.start+ue.count-ie.start):(++ve,F[ve]=ue)}F.length=ve+1;let te=e.getParameter(e.UNPACK_ROW_LENGTH),he=e.getParameter(e.UNPACK_SKIP_PIXELS),Re=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let Q=0,ie=F.length;Q<ie;Q++){let ue=F[Q],_e=Math.floor(ue.start/4),ne=Math.ceil(ue.count/4),De=_e%r.width,_=Math.floor(_e/r.width),se=ne,j=1;e.pixelStorei(e.UNPACK_SKIP_PIXELS,De),e.pixelStorei(e.UNPACK_SKIP_ROWS,_),t.texSubImage2D(e.TEXTURE_2D,0,De,_,se,j,v,H,r.data)}u.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,te),e.pixelStorei(e.UNPACK_SKIP_PIXELS,he),e.pixelStorei(e.UNPACK_SKIP_ROWS,Re)}}function W(u,r,v){let H=e.TEXTURE_2D;(r.isDataArrayTexture||r.isCompressedArrayTexture)&&(H=e.TEXTURE_2D_ARRAY),r.isData3DTexture&&(H=e.TEXTURE_3D);let Y=we(u,r),F=r.source;t.bindTexture(H,u.__webglTexture,e.TEXTURE0+v);let ve=i.get(F);if(F.version!==ve.__version||Y===!0){t.activeTexture(e.TEXTURE0+v);let te=nt.getPrimaries(nt.workingColorSpace),he=r.colorSpace===kt?null:nt.getPrimaries(r.colorSpace),Re=r.colorSpace===kt||te===he?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Re);let Q=U(r.image,!1,l.maxTextureSize);Q=Ke(r,Q);let ie=a.convert(r.format,r.colorSpace),ue=a.convert(r.type),_e=M(r.internalFormat,ie,ue,r.colorSpace,r.isVideoTexture);Be(H,r);let ne,De=r.mipmaps,_=r.isVideoTexture!==!0,se=ve.__version===void 0||Y===!0,j=F.dataReady,le=C(r,Q);if(r.isDepthTexture)_e=A(r.format===Vt,r.type),se&&(_?t.texStorage2D(e.TEXTURE_2D,1,_e,Q.width,Q.height):t.texImage2D(e.TEXTURE_2D,0,_e,Q.width,Q.height,0,ie,ue,null));else if(r.isDataTexture)if(De.length>0){_&&se&&t.texStorage2D(e.TEXTURE_2D,le,_e,De[0].width,De[0].height);for(let Z=0,X=De.length;Z<X;Z++)ne=De[Z],_?j&&t.texSubImage2D(e.TEXTURE_2D,Z,0,0,ne.width,ne.height,ie,ue,ne.data):t.texImage2D(e.TEXTURE_2D,Z,_e,ne.width,ne.height,0,ie,ue,ne.data);r.generateMipmaps=!1}else _?(se&&t.texStorage2D(e.TEXTURE_2D,le,_e,Q.width,Q.height),j&&je(r,Q,ie,ue)):t.texImage2D(e.TEXTURE_2D,0,_e,Q.width,Q.height,0,ie,ue,Q.data);else if(r.isCompressedTexture)if(r.isCompressedArrayTexture){_&&se&&t.texStorage3D(e.TEXTURE_2D_ARRAY,le,_e,De[0].width,De[0].height,Q.depth);for(let Z=0,X=De.length;Z<X;Z++)if(ne=De[Z],r.format!==At)if(ie!==null)if(_){if(j)if(r.layerUpdates.size>0){let ee=ar(ne.width,ne.height,r.format,r.type);for(let be of r.layerUpdates){let $e=ne.data.subarray(be*ee/ne.data.BYTES_PER_ELEMENT,(be+1)*ee/ne.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,be,ne.width,ne.height,1,ie,$e)}r.clearLayerUpdates()}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,ne.width,ne.height,Q.depth,ie,ne.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Z,_e,ne.width,ne.height,Q.depth,0,ne.data,0,0);else ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else _?j&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,ne.width,ne.height,Q.depth,ie,ue,ne.data):t.texImage3D(e.TEXTURE_2D_ARRAY,Z,_e,ne.width,ne.height,Q.depth,0,ie,ue,ne.data)}else{_&&se&&t.texStorage2D(e.TEXTURE_2D,le,_e,De[0].width,De[0].height);for(let Z=0,X=De.length;Z<X;Z++)ne=De[Z],r.format!==At?ie!==null?_?j&&t.compressedTexSubImage2D(e.TEXTURE_2D,Z,0,0,ne.width,ne.height,ie,ne.data):t.compressedTexImage2D(e.TEXTURE_2D,Z,_e,ne.width,ne.height,0,ne.data):ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):_?j&&t.texSubImage2D(e.TEXTURE_2D,Z,0,0,ne.width,ne.height,ie,ue,ne.data):t.texImage2D(e.TEXTURE_2D,Z,_e,ne.width,ne.height,0,ie,ue,ne.data)}else if(r.isDataArrayTexture)if(_){if(se&&t.texStorage3D(e.TEXTURE_2D_ARRAY,le,_e,Q.width,Q.height,Q.depth),j)if(r.layerUpdates.size>0){let Z=ar(Q.width,Q.height,r.format,r.type);for(let X of r.layerUpdates){let ee=Q.data.subarray(X*Z/Q.data.BYTES_PER_ELEMENT,(X+1)*Z/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,X,Q.width,Q.height,1,ie,ue,ee)}r.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ie,ue,Q.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,_e,Q.width,Q.height,Q.depth,0,ie,ue,Q.data);else if(r.isData3DTexture)_?(se&&t.texStorage3D(e.TEXTURE_3D,le,_e,Q.width,Q.height,Q.depth),j&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ie,ue,Q.data)):t.texImage3D(e.TEXTURE_3D,0,_e,Q.width,Q.height,Q.depth,0,ie,ue,Q.data);else if(r.isFramebufferTexture){if(se)if(_)t.texStorage2D(e.TEXTURE_2D,le,_e,Q.width,Q.height);else{let Z=Q.width,X=Q.height;for(let ee=0;ee<le;ee++)t.texImage2D(e.TEXTURE_2D,ee,_e,Z,X,0,ie,ue,null),Z>>=1,X>>=1}}else if(De.length>0){if(_&&se){let Z=me(De[0]);t.texStorage2D(e.TEXTURE_2D,le,_e,Z.width,Z.height)}for(let Z=0,X=De.length;Z<X;Z++)ne=De[Z],_?j&&t.texSubImage2D(e.TEXTURE_2D,Z,0,0,ie,ue,ne):t.texImage2D(e.TEXTURE_2D,Z,_e,ie,ue,ne);r.generateMipmaps=!1}else if(_){if(se){let Z=me(Q);t.texStorage2D(e.TEXTURE_2D,le,_e,Z.width,Z.height)}j&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,ie,ue,Q)}else t.texImage2D(e.TEXTURE_2D,0,_e,ie,ue,Q);f(r)&&o(H),ve.__version=F.version,r.onUpdate&&r.onUpdate(r)}u.__version=r.version}function $(u,r,v){if(r.image.length!==6)return;let H=we(u,r),Y=r.source;t.bindTexture(e.TEXTURE_CUBE_MAP,u.__webglTexture,e.TEXTURE0+v);let F=i.get(Y);if(Y.version!==F.__version||H===!0){t.activeTexture(e.TEXTURE0+v);let ve=nt.getPrimaries(nt.workingColorSpace),te=r.colorSpace===kt?null:nt.getPrimaries(r.colorSpace),he=r.colorSpace===kt||ve===te?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);let Re=r.isCompressedTexture||r.image[0].isCompressedTexture,Q=r.image[0]&&r.image[0].isDataTexture,ie=[];for(let X=0;X<6;X++)!Re&&!Q?ie[X]=U(r.image[X],!0,l.maxCubemapSize):ie[X]=Q?r.image[X].image:r.image[X],ie[X]=Ke(r,ie[X]);let ue=ie[0],_e=a.convert(r.format,r.colorSpace),ne=a.convert(r.type),De=M(r.internalFormat,_e,ne,r.colorSpace),_=r.isVideoTexture!==!0,se=F.__version===void 0||H===!0,j=Y.dataReady,le=C(r,ue);Be(e.TEXTURE_CUBE_MAP,r);let Z;if(Re){_&&se&&t.texStorage2D(e.TEXTURE_CUBE_MAP,le,De,ue.width,ue.height);for(let X=0;X<6;X++){Z=ie[X].mipmaps;for(let ee=0;ee<Z.length;ee++){let be=Z[ee];r.format!==At?_e!==null?_?j&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee,0,0,be.width,be.height,_e,be.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee,De,be.width,be.height,0,be.data):ze("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):_?j&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee,0,0,be.width,be.height,_e,ne,be.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee,De,be.width,be.height,0,_e,ne,be.data)}}}else{if(Z=r.mipmaps,_&&se){Z.length>0&&le++;let X=me(ie[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,le,De,X.width,X.height)}for(let X=0;X<6;X++)if(Q){_?j&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,ie[X].width,ie[X].height,_e,ne,ie[X].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,De,ie[X].width,ie[X].height,0,_e,ne,ie[X].data);for(let ee=0;ee<Z.length;ee++){let $e=Z[ee].image[X].image;_?j&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee+1,0,0,$e.width,$e.height,_e,ne,$e.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee+1,De,$e.width,$e.height,0,_e,ne,$e.data)}}else{_?j&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,_e,ne,ie[X]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,De,_e,ne,ie[X]);for(let ee=0;ee<Z.length;ee++){let be=Z[ee];_?j&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee+1,0,0,_e,ne,be.image[X]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ee+1,De,_e,ne,be.image[X])}}}f(r)&&o(e.TEXTURE_CUBE_MAP),F.__version=Y.version,r.onUpdate&&r.onUpdate(r)}u.__version=r.version}function fe(u,r,v,H,Y,F){let ve=a.convert(v.format,v.colorSpace),te=a.convert(v.type),he=M(v.internalFormat,ve,te,v.colorSpace),Re=i.get(r),Q=i.get(v);if(Q.__renderTarget=r,!Re.__hasExternalTextures){let ie=Math.max(1,r.width>>F),ue=Math.max(1,r.height>>F);Y===e.TEXTURE_3D||Y===e.TEXTURE_2D_ARRAY?t.texImage3D(Y,F,he,ie,ue,r.depth,0,ve,te,null):t.texImage2D(Y,F,he,ie,ue,0,ve,te,null)}t.bindFramebuffer(e.FRAMEBUFFER,u),at(r)?d.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,H,Y,Q.__webglTexture,0,m(r)):(Y===e.TEXTURE_2D||Y>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,H,Y,Q.__webglTexture,F),t.bindFramebuffer(e.FRAMEBUFFER,null)}function Ce(u,r,v){if(e.bindRenderbuffer(e.RENDERBUFFER,u),r.depthBuffer){let H=r.depthTexture,Y=H&&H.isDepthTexture?H.type:null,F=A(r.stencilBuffer,Y),ve=r.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;at(r)?d.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,m(r),F,r.width,r.height):v?e.renderbufferStorageMultisample(e.RENDERBUFFER,m(r),F,r.width,r.height):e.renderbufferStorage(e.RENDERBUFFER,F,r.width,r.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,ve,e.RENDERBUFFER,u)}else{let H=r.textures;for(let Y=0;Y<H.length;Y++){let F=H[Y],ve=a.convert(F.format,F.colorSpace),te=a.convert(F.type),he=M(F.internalFormat,ve,te,F.colorSpace);at(r)?d.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,m(r),he,r.width,r.height):v?e.renderbufferStorageMultisample(e.RENDERBUFFER,m(r),he,r.width,r.height):e.renderbufferStorage(e.RENDERBUFFER,he,r.width,r.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function pe(u,r,v){let H=r.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(e.FRAMEBUFFER,u),!(r.depthTexture&&r.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Y=i.get(r.depthTexture);if(Y.__renderTarget=r,(!Y.__webglTexture||r.depthTexture.image.width!==r.width||r.depthTexture.image.height!==r.height)&&(r.depthTexture.image.width=r.width,r.depthTexture.image.height=r.height,r.depthTexture.needsUpdate=!0),H){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,r.depthTexture.addEventListener("dispose",T)),Y.__webglTexture===void 0){Y.__webglTexture=e.createTexture(),t.bindTexture(e.TEXTURE_CUBE_MAP,Y.__webglTexture),Be(e.TEXTURE_CUBE_MAP,r.depthTexture);let Re=a.convert(r.depthTexture.format),Q=a.convert(r.depthTexture.type),ie;r.depthTexture.format===Ht?ie=e.DEPTH_COMPONENT24:r.depthTexture.format===Vt&&(ie=e.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,ie,r.width,r.height,0,Re,Q,null)}}else K(r.depthTexture,0);let F=Y.__webglTexture,ve=m(r),te=H?e.TEXTURE_CUBE_MAP_POSITIVE_X+v:e.TEXTURE_2D,he=r.depthTexture.format===Vt?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(r.depthTexture.format===Ht)at(r)?d.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,he,te,F,0,ve):e.framebufferTexture2D(e.FRAMEBUFFER,he,te,F,0);else if(r.depthTexture.format===Vt)at(r)?d.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,he,te,F,0,ve):e.framebufferTexture2D(e.FRAMEBUFFER,he,te,F,0);else throw new Error("Unknown depthTexture format")}function ye(u){let r=i.get(u),v=u.isWebGLCubeRenderTarget===!0;if(r.__boundDepthTexture!==u.depthTexture){let H=u.depthTexture;if(r.__depthDisposeCallback&&r.__depthDisposeCallback(),H){let Y=()=>{delete r.__boundDepthTexture,delete r.__depthDisposeCallback,H.removeEventListener("dispose",Y)};H.addEventListener("dispose",Y),r.__depthDisposeCallback=Y}r.__boundDepthTexture=H}if(u.depthTexture&&!r.__autoAllocateDepthBuffer)if(v)for(let H=0;H<6;H++)pe(r.__webglFramebuffer[H],u,H);else{let H=u.texture.mipmaps;H&&H.length>0?pe(r.__webglFramebuffer[0],u,0):pe(r.__webglFramebuffer,u,0)}else if(v){r.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(t.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[H]),r.__webglDepthbuffer[H]===void 0)r.__webglDepthbuffer[H]=e.createRenderbuffer(),Ce(r.__webglDepthbuffer[H],u,!1);else{let Y=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,F=r.__webglDepthbuffer[H];e.bindRenderbuffer(e.RENDERBUFFER,F),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,F)}}else{let H=u.texture.mipmaps;if(H&&H.length>0?t.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[0]):t.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer),r.__webglDepthbuffer===void 0)r.__webglDepthbuffer=e.createRenderbuffer(),Ce(r.__webglDepthbuffer,u,!1);else{let Y=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,F=r.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,F),e.framebufferRenderbuffer(e.FRAMEBUFFER,Y,e.RENDERBUFFER,F)}}t.bindFramebuffer(e.FRAMEBUFFER,null)}function lt(u,r,v){let H=i.get(u);r!==void 0&&fe(H.__webglFramebuffer,u,u.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),v!==void 0&&ye(u)}function Ie(u){let r=u.texture,v=i.get(u),H=i.get(r);u.addEventListener("dispose",N);let Y=u.textures,F=u.isWebGLCubeRenderTarget===!0,ve=Y.length>1;if(ve||(H.__webglTexture===void 0&&(H.__webglTexture=e.createTexture()),H.__version=r.version,h.memory.textures++),F){v.__webglFramebuffer=[];for(let te=0;te<6;te++)if(r.mipmaps&&r.mipmaps.length>0){v.__webglFramebuffer[te]=[];for(let he=0;he<r.mipmaps.length;he++)v.__webglFramebuffer[te][he]=e.createFramebuffer()}else v.__webglFramebuffer[te]=e.createFramebuffer()}else{if(r.mipmaps&&r.mipmaps.length>0){v.__webglFramebuffer=[];for(let te=0;te<r.mipmaps.length;te++)v.__webglFramebuffer[te]=e.createFramebuffer()}else v.__webglFramebuffer=e.createFramebuffer();if(ve)for(let te=0,he=Y.length;te<he;te++){let Re=i.get(Y[te]);Re.__webglTexture===void 0&&(Re.__webglTexture=e.createTexture(),h.memory.textures++)}if(u.samples>0&&at(u)===!1){v.__webglMultisampledFramebuffer=e.createFramebuffer(),v.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,v.__webglMultisampledFramebuffer);for(let te=0;te<Y.length;te++){let he=Y[te];v.__webglColorRenderbuffer[te]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,v.__webglColorRenderbuffer[te]);let Re=a.convert(he.format,he.colorSpace),Q=a.convert(he.type),ie=M(he.internalFormat,Re,Q,he.colorSpace,u.isXRRenderTarget===!0),ue=m(u);e.renderbufferStorageMultisample(e.RENDERBUFFER,ue,ie,u.width,u.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+te,e.RENDERBUFFER,v.__webglColorRenderbuffer[te])}e.bindRenderbuffer(e.RENDERBUFFER,null),u.depthBuffer&&(v.__webglDepthRenderbuffer=e.createRenderbuffer(),Ce(v.__webglDepthRenderbuffer,u,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(F){t.bindTexture(e.TEXTURE_CUBE_MAP,H.__webglTexture),Be(e.TEXTURE_CUBE_MAP,r);for(let te=0;te<6;te++)if(r.mipmaps&&r.mipmaps.length>0)for(let he=0;he<r.mipmaps.length;he++)fe(v.__webglFramebuffer[te][he],u,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+te,he);else fe(v.__webglFramebuffer[te],u,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+te,0);f(r)&&o(e.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ve){for(let te=0,he=Y.length;te<he;te++){let Re=Y[te],Q=i.get(Re),ie=e.TEXTURE_2D;(u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(ie=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(ie,Q.__webglTexture),Be(ie,Re),fe(v.__webglFramebuffer,u,Re,e.COLOR_ATTACHMENT0+te,ie,0),f(Re)&&o(ie)}t.unbindTexture()}else{let te=e.TEXTURE_2D;if((u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(te=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(te,H.__webglTexture),Be(te,r),r.mipmaps&&r.mipmaps.length>0)for(let he=0;he<r.mipmaps.length;he++)fe(v.__webglFramebuffer[he],u,r,e.COLOR_ATTACHMENT0,te,he);else fe(v.__webglFramebuffer,u,r,e.COLOR_ATTACHMENT0,te,0);f(r)&&o(te),t.unbindTexture()}u.depthBuffer&&ye(u)}function He(u){let r=u.textures;for(let v=0,H=r.length;v<H;v++){let Y=r[v];if(f(Y)){let F=P(u),ve=i.get(Y).__webglTexture;t.bindTexture(F,ve),o(F),t.unbindTexture()}}}let Xe=[],Le=[];function rt(u){if(u.samples>0){if(at(u)===!1){let r=u.textures,v=u.width,H=u.height,Y=e.COLOR_BUFFER_BIT,F=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ve=i.get(u),te=r.length>1;if(te)for(let Re=0;Re<r.length;Re++)t.bindFramebuffer(e.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,ve.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer);let he=u.texture.mipmaps;he&&he.length>0?t.bindFramebuffer(e.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(e.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let Re=0;Re<r.length;Re++){if(u.resolveDepthBuffer&&(u.depthBuffer&&(Y|=e.DEPTH_BUFFER_BIT),u.stencilBuffer&&u.resolveStencilBuffer&&(Y|=e.STENCIL_BUFFER_BIT)),te){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ve.__webglColorRenderbuffer[Re]);let Q=i.get(r[Re]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Q,0)}e.blitFramebuffer(0,0,v,H,0,0,v,H,Y,e.NEAREST),b===!0&&(Xe.length=0,Le.length=0,Xe.push(e.COLOR_ATTACHMENT0+Re),u.depthBuffer&&u.resolveDepthBuffer===!1&&(Xe.push(F),Le.push(F),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Le)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Xe))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),te)for(let Re=0;Re<r.length;Re++){t.bindFramebuffer(e.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.RENDERBUFFER,ve.__webglColorRenderbuffer[Re]);let Q=i.get(r[Re]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,ve.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.TEXTURE_2D,Q,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(u.depthBuffer&&u.resolveDepthBuffer===!1&&b){let r=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[r])}}}function m(u){return Math.min(l.maxSamples,u.samples)}function at(u){let r=i.get(u);return u.samples>0&&n.has("WEBGL_multisampled_render_to_texture")===!0&&r.__useRenderToTexture!==!1}function Ge(u){let r=h.render.frame;w.get(u)!==r&&(w.set(u,r),u.update())}function Ke(u,r){let v=u.colorSpace,H=u.format,Y=u.type;return u.isCompressedTexture===!0||u.isVideoTexture===!0||v!==un&&v!==kt&&(nt.getTransfer(v)===qe?(H!==At||Y!==xt)&&ze("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qe("WebGLTextures: Unsupported texture color space:",v)),r}function me(u){return typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement?(x.width=u.naturalWidth||u.width,x.height=u.naturalHeight||u.height):typeof VideoFrame<"u"&&u instanceof VideoFrame?(x.width=u.displayWidth,x.height=u.displayHeight):(x.width=u.width,x.height=u.height),x}this.allocateTextureUnit=G,this.resetTextureUnits=k,this.setTexture2D=K,this.setTexture2DArray=B,this.setTexture3D=V,this.setTextureCube=J,this.rebindTextures=lt,this.setupRenderTarget=Ie,this.updateRenderTargetMipmap=He,this.updateMultisampleRenderTarget=rt,this.setupDepthRenderbuffer=ye,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=at,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function od(e,n){function t(i,l=kt){let a,h=nt.getTransfer(l);if(i===xt)return e.UNSIGNED_BYTE;if(i===si)return e.UNSIGNED_SHORT_4_4_4_4;if(i===li)return e.UNSIGNED_SHORT_5_5_5_1;if(i===la)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===ca)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===oa)return e.BYTE;if(i===sa)return e.SHORT;if(i===dn)return e.UNSIGNED_SHORT;if(i===oi)return e.INT;if(i===yt)return e.UNSIGNED_INT;if(i===Dt)return e.FLOAT;if(i===Ut)return e.HALF_FLOAT;if(i===fa)return e.ALPHA;if(i===da)return e.RGB;if(i===At)return e.RGBA;if(i===Ht)return e.DEPTH_COMPONENT;if(i===Vt)return e.DEPTH_STENCIL;if(i===ua)return e.RED;if(i===ci)return e.RED_INTEGER;if(i===en)return e.RG;if(i===fi)return e.RG_INTEGER;if(i===di)return e.RGBA_INTEGER;if(i===In||i===Nn||i===yn||i===Fn)if(h===qe)if(a=n.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===In)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Nn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===yn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Fn)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=n.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===In)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Nn)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===yn)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Fn)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===ui||i===pi||i===hi||i===mi)if(a=n.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===ui)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===pi)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===hi)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===mi)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===_i||i===gi||i===vi||i===Si||i===Ei||i===xi||i===Mi)if(a=n.get("WEBGL_compressed_texture_etc"),a!==null){if(i===_i||i===gi)return h===qe?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===vi)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===Si)return a.COMPRESSED_R11_EAC;if(i===Ei)return a.COMPRESSED_SIGNED_R11_EAC;if(i===xi)return a.COMPRESSED_RG11_EAC;if(i===Mi)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Ti||i===Ai||i===Ri||i===bi||i===Ci||i===Pi||i===Li||i===Di||i===Ui||i===wi||i===Ii||i===Ni||i===yi||i===Fi)if(a=n.get("WEBGL_compressed_texture_astc"),a!==null){if(i===Ti)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ai)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ri)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===bi)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Ci)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Pi)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Li)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Di)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ui)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===wi)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ii)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ni)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===yi)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Fi)return h===qe?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Oi||i===Bi||i===Gi)if(a=n.get("EXT_texture_compression_bptc"),a!==null){if(i===Oi)return h===qe?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Bi)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Gi)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Hi||i===Vi||i===ki||i===Wi)if(a=n.get("EXT_texture_compression_rgtc"),a!==null){if(i===Hi)return a.COMPRESSED_RED_RGTC1_EXT;if(i===Vi)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ki)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Wi)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===jt?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:t}}var sd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ld=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Sr=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(n,t){if(this.texture===null){let i=new nr(n.texture);(n.depthNear!==t.depthNear||n.depthFar!==t.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=i}}getMesh(n){if(this.texture!==null&&this.mesh===null){let t=n.cameras[0].viewport,i=new It({vertexShader:sd,fragmentShader:ld,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new wt(new ir(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Er=class extends ba{constructor(n,t){super();let i=this,l=null,a=1,h=null,d="local-floor",b=1,x=null,w=null,g=null,S=null,R=null,O=null,U=typeof XRWebGLBinding<"u",f=new Sr,o={},P=t.getContextAttributes(),M=null,A=null,C=[],T=[],N=new ft,q=null,c=new mn;c.viewport=new dt;let p=new mn;p.viewport=new dt;let L=[c,p],k=new ka,G=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let $=C[W];return $===void 0&&($=new Hn,C[W]=$),$.getTargetRaySpace()},this.getControllerGrip=function(W){let $=C[W];return $===void 0&&($=new Hn,C[W]=$),$.getGripSpace()},this.getHand=function(W){let $=C[W];return $===void 0&&($=new Hn,C[W]=$),$.getHandSpace()};function K(W){let $=T.indexOf(W.inputSource);if($===-1)return;let fe=C[$];fe!==void 0&&(fe.update(W.inputSource,W.frame,x||h),fe.dispatchEvent({type:W.type,data:W.inputSource}))}function B(){l.removeEventListener("select",K),l.removeEventListener("selectstart",K),l.removeEventListener("selectend",K),l.removeEventListener("squeeze",K),l.removeEventListener("squeezestart",K),l.removeEventListener("squeezeend",K),l.removeEventListener("end",B),l.removeEventListener("inputsourceschange",V);for(let W=0;W<C.length;W++){let $=T[W];$!==null&&(T[W]=null,C[W].disconnect($))}G=null,z=null,f.reset();for(let W in o)delete o[W];n.setRenderTarget(M),R=null,S=null,g=null,l=null,A=null,je.stop(),i.isPresenting=!1,n.setPixelRatio(q),n.setSize(N.width,N.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){a=W,i.isPresenting===!0&&ze("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){d=W,i.isPresenting===!0&&ze("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return x||h},this.setReferenceSpace=function(W){x=W},this.getBaseLayer=function(){return S!==null?S:R},this.getBinding=function(){return g===null&&U&&(g=new XRWebGLBinding(l,t)),g},this.getFrame=function(){return O},this.getSession=function(){return l},this.setSession=async function(W){if(l=W,l!==null){if(M=n.getRenderTarget(),l.addEventListener("select",K),l.addEventListener("selectstart",K),l.addEventListener("selectend",K),l.addEventListener("squeeze",K),l.addEventListener("squeezestart",K),l.addEventListener("squeezeend",K),l.addEventListener("end",B),l.addEventListener("inputsourceschange",V),P.xrCompatible!==!0&&await t.makeXRCompatible(),q=n.getPixelRatio(),n.getSize(N),U&&"createProjectionLayer"in XRWebGLBinding.prototype){let fe=null,Ce=null,pe=null;P.depth&&(pe=P.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,fe=P.stencil?Vt:Ht,Ce=P.stencil?jt:yt);let ye={colorFormat:t.RGBA8,depthFormat:pe,scaleFactor:a};g=this.getBinding(),S=g.createProjectionLayer(ye),l.updateRenderState({layers:[S]}),n.setPixelRatio(1),n.setSize(S.textureWidth,S.textureHeight,!1),A=new Rt(S.textureWidth,S.textureHeight,{format:At,type:xt,depthTexture:new _n(S.textureWidth,S.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,fe),stencilBuffer:P.stencil,colorSpace:n.outputColorSpace,samples:P.antialias?4:0,resolveDepthBuffer:S.ignoreDepthValues===!1,resolveStencilBuffer:S.ignoreDepthValues===!1})}else{let fe={antialias:P.antialias,alpha:!0,depth:P.depth,stencil:P.stencil,framebufferScaleFactor:a};R=new XRWebGLLayer(l,t,fe),l.updateRenderState({baseLayer:R}),n.setPixelRatio(1),n.setSize(R.framebufferWidth,R.framebufferHeight,!1),A=new Rt(R.framebufferWidth,R.framebufferHeight,{format:At,type:xt,colorSpace:n.outputColorSpace,stencilBuffer:P.stencil,resolveDepthBuffer:R.ignoreDepthValues===!1,resolveStencilBuffer:R.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(b),x=null,h=await l.requestReferenceSpace(d),je.setContext(l),je.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function V(W){for(let $=0;$<W.removed.length;$++){let fe=W.removed[$],Ce=T.indexOf(fe);Ce>=0&&(T[Ce]=null,C[Ce].disconnect(fe))}for(let $=0;$<W.added.length;$++){let fe=W.added[$],Ce=T.indexOf(fe);if(Ce===-1){for(let ye=0;ye<C.length;ye++)if(ye>=T.length){T.push(fe),Ce=ye;break}else if(T[ye]===null){T[ye]=fe,Ce=ye;break}if(Ce===-1)break}let pe=C[Ce];pe&&pe.connect(fe)}}let J=new Oe,xe=new Oe;function ge(W,$,fe){J.setFromMatrixPosition($.matrixWorld),xe.setFromMatrixPosition(fe.matrixWorld);let Ce=J.distanceTo(xe),pe=$.projectionMatrix.elements,ye=fe.projectionMatrix.elements,lt=pe[14]/(pe[10]-1),Ie=pe[14]/(pe[10]+1),He=(pe[9]+1)/pe[5],Xe=(pe[9]-1)/pe[5],Le=(pe[8]-1)/pe[0],rt=(ye[8]+1)/ye[0],m=lt*Le,at=lt*rt,Ge=Ce/(-Le+rt),Ke=Ge*-Le;if($.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(Ke),W.translateZ(Ge),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),pe[10]===-1)W.projectionMatrix.copy($.projectionMatrix),W.projectionMatrixInverse.copy($.projectionMatrixInverse);else{let me=lt+Ge,u=Ie+Ge,r=m-Ke,v=at+(Ce-Ke),H=He*Ie/u*me,Y=Xe*Ie/u*me;W.projectionMatrix.makePerspective(r,v,H,Y,me,u),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function Ee(W,$){$===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices($.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(l===null)return;let $=W.near,fe=W.far;f.texture!==null&&(f.depthNear>0&&($=f.depthNear),f.depthFar>0&&(fe=f.depthFar)),k.near=p.near=c.near=$,k.far=p.far=c.far=fe,(G!==k.near||z!==k.far)&&(l.updateRenderState({depthNear:k.near,depthFar:k.far}),G=k.near,z=k.far),k.layers.mask=W.layers.mask|6,c.layers.mask=k.layers.mask&3,p.layers.mask=k.layers.mask&5;let Ce=W.parent,pe=k.cameras;Ee(k,Ce);for(let ye=0;ye<pe.length;ye++)Ee(pe[ye],Ce);pe.length===2?ge(k,c,p):k.projectionMatrix.copy(c.projectionMatrix),Be(W,k,Ce)};function Be(W,$,fe){fe===null?W.matrix.copy($.matrixWorld):(W.matrix.copy(fe.matrixWorld),W.matrix.invert(),W.matrix.multiply($.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy($.projectionMatrix),W.projectionMatrixInverse.copy($.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Ca*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(S===null&&R===null))return b},this.setFoveation=function(W){b=W,S!==null&&(S.fixedFoveation=W),R!==null&&R.fixedFoveation!==void 0&&(R.fixedFoveation=W)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(k)},this.getCameraTexture=function(W){return o[W]};let we=null;function it(W,$){if(w=$.getViewerPose(x||h),O=$,w!==null){let fe=w.views;R!==null&&(n.setRenderTargetFramebuffer(A,R.framebuffer),n.setRenderTarget(A));let Ce=!1;fe.length!==k.cameras.length&&(k.cameras.length=0,Ce=!0);for(let Ie=0;Ie<fe.length;Ie++){let He=fe[Ie],Xe=null;if(R!==null)Xe=R.getViewport(He);else{let rt=g.getViewSubImage(S,He);Xe=rt.viewport,Ie===0&&(n.setRenderTargetTextures(A,rt.colorTexture,rt.depthStencilTexture),n.setRenderTarget(A))}let Le=L[Ie];Le===void 0&&(Le=new mn,Le.layers.enable(Ie),Le.viewport=new dt,L[Ie]=Le),Le.matrix.fromArray(He.transform.matrix),Le.matrix.decompose(Le.position,Le.quaternion,Le.scale),Le.projectionMatrix.fromArray(He.projectionMatrix),Le.projectionMatrixInverse.copy(Le.projectionMatrix).invert(),Le.viewport.set(Xe.x,Xe.y,Xe.width,Xe.height),Ie===0&&(k.matrix.copy(Le.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Ce===!0&&k.cameras.push(Le)}let pe=l.enabledFeatures;if(pe&&pe.includes("depth-sensing")&&l.depthUsage=="gpu-optimized"&&U){g=i.getBinding();let Ie=g.getDepthInformation(fe[0]);Ie&&Ie.isValid&&Ie.texture&&f.init(Ie,l.renderState)}if(pe&&pe.includes("camera-access")&&U){n.state.unbindTexture(),g=i.getBinding();for(let Ie=0;Ie<fe.length;Ie++){let He=fe[Ie].camera;if(He){let Xe=o[He];Xe||(Xe=new nr,o[He]=Xe);let Le=g.getCameraImage(He);Xe.sourceTexture=Le}}}}for(let fe=0;fe<C.length;fe++){let Ce=T[fe],pe=C[fe];Ce!==null&&pe!==void 0&&pe.update(Ce,$,x||h)}we&&we(W,$),$.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:$}),O=null}let je=new po;je.setAnimationLoop(it),this.setAnimationLoop=function(W){we=W},this.dispose=function(){}}},Xt=new $i,cd=new Wt;function fd(e,n){function t(f,o){f.matrixAutoUpdate===!0&&f.updateMatrix(),o.value.copy(f.matrix)}function i(f,o){o.color.getRGB(f.fogColor.value,ji(e)),o.isFog?(f.fogNear.value=o.near,f.fogFar.value=o.far):o.isFogExp2&&(f.fogDensity.value=o.density)}function l(f,o,P,M,A){o.isMeshBasicMaterial||o.isMeshLambertMaterial?a(f,o):o.isMeshToonMaterial?(a(f,o),g(f,o)):o.isMeshPhongMaterial?(a(f,o),w(f,o)):o.isMeshStandardMaterial?(a(f,o),S(f,o),o.isMeshPhysicalMaterial&&R(f,o,A)):o.isMeshMatcapMaterial?(a(f,o),O(f,o)):o.isMeshDepthMaterial?a(f,o):o.isMeshDistanceMaterial?(a(f,o),U(f,o)):o.isMeshNormalMaterial?a(f,o):o.isLineBasicMaterial?(h(f,o),o.isLineDashedMaterial&&d(f,o)):o.isPointsMaterial?b(f,o,P,M):o.isSpriteMaterial?x(f,o):o.isShadowMaterial?(f.color.value.copy(o.color),f.opacity.value=o.opacity):o.isShaderMaterial&&(o.uniformsNeedUpdate=!1)}function a(f,o){f.opacity.value=o.opacity,o.color&&f.diffuse.value.copy(o.color),o.emissive&&f.emissive.value.copy(o.emissive).multiplyScalar(o.emissiveIntensity),o.map&&(f.map.value=o.map,t(o.map,f.mapTransform)),o.alphaMap&&(f.alphaMap.value=o.alphaMap,t(o.alphaMap,f.alphaMapTransform)),o.bumpMap&&(f.bumpMap.value=o.bumpMap,t(o.bumpMap,f.bumpMapTransform),f.bumpScale.value=o.bumpScale,o.side===gt&&(f.bumpScale.value*=-1)),o.normalMap&&(f.normalMap.value=o.normalMap,t(o.normalMap,f.normalMapTransform),f.normalScale.value.copy(o.normalScale),o.side===gt&&f.normalScale.value.negate()),o.displacementMap&&(f.displacementMap.value=o.displacementMap,t(o.displacementMap,f.displacementMapTransform),f.displacementScale.value=o.displacementScale,f.displacementBias.value=o.displacementBias),o.emissiveMap&&(f.emissiveMap.value=o.emissiveMap,t(o.emissiveMap,f.emissiveMapTransform)),o.specularMap&&(f.specularMap.value=o.specularMap,t(o.specularMap,f.specularMapTransform)),o.alphaTest>0&&(f.alphaTest.value=o.alphaTest);let P=n.get(o),M=P.envMap,A=P.envMapRotation;M&&(f.envMap.value=M,Xt.copy(A),Xt.x*=-1,Xt.y*=-1,Xt.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Xt.y*=-1,Xt.z*=-1),f.envMapRotation.value.setFromMatrix4(cd.makeRotationFromEuler(Xt)),f.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=o.reflectivity,f.ior.value=o.ior,f.refractionRatio.value=o.refractionRatio),o.lightMap&&(f.lightMap.value=o.lightMap,f.lightMapIntensity.value=o.lightMapIntensity,t(o.lightMap,f.lightMapTransform)),o.aoMap&&(f.aoMap.value=o.aoMap,f.aoMapIntensity.value=o.aoMapIntensity,t(o.aoMap,f.aoMapTransform))}function h(f,o){f.diffuse.value.copy(o.color),f.opacity.value=o.opacity,o.map&&(f.map.value=o.map,t(o.map,f.mapTransform))}function d(f,o){f.dashSize.value=o.dashSize,f.totalSize.value=o.dashSize+o.gapSize,f.scale.value=o.scale}function b(f,o,P,M){f.diffuse.value.copy(o.color),f.opacity.value=o.opacity,f.size.value=o.size*P,f.scale.value=M*.5,o.map&&(f.map.value=o.map,t(o.map,f.uvTransform)),o.alphaMap&&(f.alphaMap.value=o.alphaMap,t(o.alphaMap,f.alphaMapTransform)),o.alphaTest>0&&(f.alphaTest.value=o.alphaTest)}function x(f,o){f.diffuse.value.copy(o.color),f.opacity.value=o.opacity,f.rotation.value=o.rotation,o.map&&(f.map.value=o.map,t(o.map,f.mapTransform)),o.alphaMap&&(f.alphaMap.value=o.alphaMap,t(o.alphaMap,f.alphaMapTransform)),o.alphaTest>0&&(f.alphaTest.value=o.alphaTest)}function w(f,o){f.specular.value.copy(o.specular),f.shininess.value=Math.max(o.shininess,1e-4)}function g(f,o){o.gradientMap&&(f.gradientMap.value=o.gradientMap)}function S(f,o){f.metalness.value=o.metalness,o.metalnessMap&&(f.metalnessMap.value=o.metalnessMap,t(o.metalnessMap,f.metalnessMapTransform)),f.roughness.value=o.roughness,o.roughnessMap&&(f.roughnessMap.value=o.roughnessMap,t(o.roughnessMap,f.roughnessMapTransform)),o.envMap&&(f.envMapIntensity.value=o.envMapIntensity)}function R(f,o,P){f.ior.value=o.ior,o.sheen>0&&(f.sheenColor.value.copy(o.sheenColor).multiplyScalar(o.sheen),f.sheenRoughness.value=o.sheenRoughness,o.sheenColorMap&&(f.sheenColorMap.value=o.sheenColorMap,t(o.sheenColorMap,f.sheenColorMapTransform)),o.sheenRoughnessMap&&(f.sheenRoughnessMap.value=o.sheenRoughnessMap,t(o.sheenRoughnessMap,f.sheenRoughnessMapTransform))),o.clearcoat>0&&(f.clearcoat.value=o.clearcoat,f.clearcoatRoughness.value=o.clearcoatRoughness,o.clearcoatMap&&(f.clearcoatMap.value=o.clearcoatMap,t(o.clearcoatMap,f.clearcoatMapTransform)),o.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=o.clearcoatRoughnessMap,t(o.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),o.clearcoatNormalMap&&(f.clearcoatNormalMap.value=o.clearcoatNormalMap,t(o.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(o.clearcoatNormalScale),o.side===gt&&f.clearcoatNormalScale.value.negate())),o.dispersion>0&&(f.dispersion.value=o.dispersion),o.iridescence>0&&(f.iridescence.value=o.iridescence,f.iridescenceIOR.value=o.iridescenceIOR,f.iridescenceThicknessMinimum.value=o.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=o.iridescenceThicknessRange[1],o.iridescenceMap&&(f.iridescenceMap.value=o.iridescenceMap,t(o.iridescenceMap,f.iridescenceMapTransform)),o.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=o.iridescenceThicknessMap,t(o.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),o.transmission>0&&(f.transmission.value=o.transmission,f.transmissionSamplerMap.value=P.texture,f.transmissionSamplerSize.value.set(P.width,P.height),o.transmissionMap&&(f.transmissionMap.value=o.transmissionMap,t(o.transmissionMap,f.transmissionMapTransform)),f.thickness.value=o.thickness,o.thicknessMap&&(f.thicknessMap.value=o.thicknessMap,t(o.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=o.attenuationDistance,f.attenuationColor.value.copy(o.attenuationColor)),o.anisotropy>0&&(f.anisotropyVector.value.set(o.anisotropy*Math.cos(o.anisotropyRotation),o.anisotropy*Math.sin(o.anisotropyRotation)),o.anisotropyMap&&(f.anisotropyMap.value=o.anisotropyMap,t(o.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=o.specularIntensity,f.specularColor.value.copy(o.specularColor),o.specularColorMap&&(f.specularColorMap.value=o.specularColorMap,t(o.specularColorMap,f.specularColorMapTransform)),o.specularIntensityMap&&(f.specularIntensityMap.value=o.specularIntensityMap,t(o.specularIntensityMap,f.specularIntensityMapTransform))}function O(f,o){o.matcap&&(f.matcap.value=o.matcap)}function U(f,o){let P=n.get(o).light;f.referencePosition.value.setFromMatrixPosition(P.matrixWorld),f.nearDistance.value=P.shadow.camera.near,f.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:l}}function dd(e,n,t,i){let l={},a={},h=[],d=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function b(P,M){let A=M.program;i.uniformBlockBinding(P,A)}function x(P,M){let A=l[P.id];A===void 0&&(O(P),A=w(P),l[P.id]=A,P.addEventListener("dispose",f));let C=M.program;i.updateUBOMapping(P,C);let T=n.render.frame;a[P.id]!==T&&(S(P),a[P.id]=T)}function w(P){let M=g();P.__bindingPointIndex=M;let A=e.createBuffer(),C=P.__size,T=P.usage;return e.bindBuffer(e.UNIFORM_BUFFER,A),e.bufferData(e.UNIFORM_BUFFER,C,T),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,M,A),A}function g(){for(let P=0;P<d;P++)if(h.indexOf(P)===-1)return h.push(P),P;return Qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function S(P){let M=l[P.id],A=P.uniforms,C=P.__cache;e.bindBuffer(e.UNIFORM_BUFFER,M);for(let T=0,N=A.length;T<N;T++){let q=Array.isArray(A[T])?A[T]:[A[T]];for(let c=0,p=q.length;c<p;c++){let L=q[c];if(R(L,T,c,C)===!0){let k=L.__offset,G=Array.isArray(L.value)?L.value:[L.value],z=0;for(let K=0;K<G.length;K++){let B=G[K],V=U(B);typeof B=="number"||typeof B=="boolean"?(L.__data[0]=B,e.bufferSubData(e.UNIFORM_BUFFER,k+z,L.__data)):B.isMatrix3?(L.__data[0]=B.elements[0],L.__data[1]=B.elements[1],L.__data[2]=B.elements[2],L.__data[3]=0,L.__data[4]=B.elements[3],L.__data[5]=B.elements[4],L.__data[6]=B.elements[5],L.__data[7]=0,L.__data[8]=B.elements[6],L.__data[9]=B.elements[7],L.__data[10]=B.elements[8],L.__data[11]=0):(B.toArray(L.__data,z),z+=V.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,k,L.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function R(P,M,A,C){let T=P.value,N=M+"_"+A;if(C[N]===void 0)return typeof T=="number"||typeof T=="boolean"?C[N]=T:C[N]=T.clone(),!0;{let q=C[N];if(typeof T=="number"||typeof T=="boolean"){if(q!==T)return C[N]=T,!0}else if(q.equals(T)===!1)return q.copy(T),!0}return!1}function O(P){let M=P.uniforms,A=0,C=16;for(let N=0,q=M.length;N<q;N++){let c=Array.isArray(M[N])?M[N]:[M[N]];for(let p=0,L=c.length;p<L;p++){let k=c[p],G=Array.isArray(k.value)?k.value:[k.value];for(let z=0,K=G.length;z<K;z++){let B=G[z],V=U(B),J=A%C,xe=J%V.boundary,ge=J+xe;A+=xe,ge!==0&&C-ge<V.storage&&(A+=C-ge),k.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=A,A+=V.storage}}}let T=A%C;return T>0&&(A+=C-T),P.__size=A,P.__cache={},this}function U(P){let M={boundary:0,storage:0};return typeof P=="number"||typeof P=="boolean"?(M.boundary=4,M.storage=4):P.isVector2?(M.boundary=8,M.storage=8):P.isVector3||P.isColor?(M.boundary=16,M.storage=12):P.isVector4?(M.boundary=16,M.storage=16):P.isMatrix3?(M.boundary=48,M.storage=48):P.isMatrix4?(M.boundary=64,M.storage=64):P.isTexture?ze("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ze("WebGLRenderer: Unsupported uniform value type.",P),M}function f(P){let M=P.target;M.removeEventListener("dispose",f);let A=h.indexOf(M.__bindingPointIndex);h.splice(A,1),e.deleteBuffer(l[M.id]),delete l[M.id],delete a[M.id]}function o(){for(let P in l)e.deleteBuffer(l[P]);h=[],l={},a={}}return{bind:b,update:x,dispose:o}}var ud=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),bt=null;function pd(){return bt===null&&(bt=new Fa(ud,16,16,en,Ut),bt.name="DFG_LUT",bt.minFilter=vt,bt.magFilter=vt,bt.wrapS=Un,bt.wrapT=Un,bt.generateMipmaps=!1,bt.needsUpdate=!0),bt}var uo=class{constructor(n={}){let{canvas:t=Aa(),context:i=null,depth:l=!0,stencil:a=!1,alpha:h=!1,antialias:d=!1,premultipliedAlpha:b=!0,preserveDrawingBuffer:x=!1,powerPreference:w="default",failIfMajorPerformanceCaveat:g=!1,reversedDepthBuffer:S=!1,outputBufferType:R=xt}=n;this.isWebGLRenderer=!0;let O;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");O=i.getContextAttributes().alpha}else O=h;let U=R,f=new Set([di,fi,ci]),o=new Set([xt,yt,dn,jt,si,li]),P=new Uint32Array(4),M=new Int32Array(4),A=null,C=null,T=[],N=[],q=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Et,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let c=this,p=!1;this._outputColorSpace=ma;let L=0,k=0,G=null,z=-1,K=null,B=new dt,V=new dt,J=null,xe=new Je(0),ge=0,Ee=t.width,Be=t.height,we=1,it=null,je=null,W=new dt(0,0,Ee,Be),$=new dt(0,0,Ee,Be),fe=!1,Ce=new tr,pe=!1,ye=!1,lt=new Wt,Ie=new Oe,He=new dt,Xe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Le=!1;function rt(){return G===null?we:1}let m=i;function at(s,E){return t.getContext(s,E)}try{let s={alpha:!0,depth:l,stencil:a,antialias:d,premultipliedAlpha:b,preserveDrawingBuffer:x,powerPreference:w,failIfMajorPerformanceCaveat:g};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"182"}`),t.addEventListener("webglcontextlost",be,!1),t.addEventListener("webglcontextrestored",$e,!1),t.addEventListener("webglcontextcreationerror",Ve,!1),m===null){let E="webgl2";if(m=at(E,s),m===null)throw at(E)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(s){throw Qe("WebGLRenderer: "+s.message),s}let Ge,Ke,me,u,r,v,H,Y,F,ve,te,he,Re,Q,ie,ue,_e,ne,De,_,se,j,le,Z;function X(){Ge=new Sc(m),Ge.init(),j=new od(m,Ge),Ke=new fc(m,Ge,n,j),me=new rd(m,Ge),Ke.reversedDepthBuffer&&S&&me.buffers.depth.setReversed(!0),u=new Mc(m),r=new Wf,v=new ad(m,Ge,me,r,Ke,j,u),H=new uc(c),Y=new vc(c),F=new bo(m),le=new lc(m,F),ve=new Ec(m,F,u,le),te=new Ac(m,ve,F,u),De=new Tc(m,Ke,v),ue=new dc(r),he=new kf(c,H,Y,Ge,Ke,le,ue),Re=new fd(c,r),Q=new Xf,ie=new Qf(Ge),ne=new sc(c,H,Y,me,te,O,b),_e=new nd(c,te,Ke),Z=new dd(m,u,Ke,me),_=new cc(m,Ge,u),se=new xc(m,Ge,u),u.programs=he.programs,c.capabilities=Ke,c.extensions=Ge,c.properties=r,c.renderLists=Q,c.shadowMap=_e,c.state=me,c.info=u}X(),U!==xt&&(q=new bc(U,t.width,t.height,l,a));let ee=new Er(c,m);this.xr=ee,this.getContext=function(){return m},this.getContextAttributes=function(){return m.getContextAttributes()},this.forceContextLoss=function(){let s=Ge.get("WEBGL_lose_context");s&&s.loseContext()},this.forceContextRestore=function(){let s=Ge.get("WEBGL_lose_context");s&&s.restoreContext()},this.getPixelRatio=function(){return we},this.setPixelRatio=function(s){s!==void 0&&(we=s,this.setSize(Ee,Be,!1))},this.getSize=function(s){return s.set(Ee,Be)},this.setSize=function(s,E,y=!0){if(ee.isPresenting){ze("WebGLRenderer: Can't change size while VR device is presenting.");return}Ee=s,Be=E,t.width=Math.floor(s*we),t.height=Math.floor(E*we),y===!0&&(t.style.width=s+"px",t.style.height=E+"px"),q!==null&&q.setSize(t.width,t.height),this.setViewport(0,0,s,E)},this.getDrawingBufferSize=function(s){return s.set(Ee*we,Be*we).floor()},this.setDrawingBufferSize=function(s,E,y){Ee=s,Be=E,we=y,t.width=Math.floor(s*y),t.height=Math.floor(E*y),this.setViewport(0,0,s,E)},this.setEffects=function(s){if(U===xt){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(s){for(let E=0;E<s.length;E++)if(s[E].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}q.setEffects(s||[])},this.getCurrentViewport=function(s){return s.copy(B)},this.getViewport=function(s){return s.copy(W)},this.setViewport=function(s,E,y,I){s.isVector4?W.set(s.x,s.y,s.z,s.w):W.set(s,E,y,I),me.viewport(B.copy(W).multiplyScalar(we).round())},this.getScissor=function(s){return s.copy($)},this.setScissor=function(s,E,y,I){s.isVector4?$.set(s.x,s.y,s.z,s.w):$.set(s,E,y,I),me.scissor(V.copy($).multiplyScalar(we).round())},this.getScissorTest=function(){return fe},this.setScissorTest=function(s){me.setScissorTest(fe=s)},this.setOpaqueSort=function(s){it=s},this.setTransparentSort=function(s){je=s},this.getClearColor=function(s){return s.copy(ne.getClearColor())},this.setClearColor=function(){ne.setClearColor(...arguments)},this.getClearAlpha=function(){return ne.getClearAlpha()},this.setClearAlpha=function(){ne.setClearAlpha(...arguments)},this.clear=function(s=!0,E=!0,y=!0){let I=0;if(s){let D=!1;if(G!==null){let re=G.texture.format;D=f.has(re)}if(D){let re=G.texture.type,ce=o.has(re),oe=ne.getClearColor(),de=ne.getClearAlpha(),Se=oe.r,Ae=oe.g,Me=oe.b;ce?(P[0]=Se,P[1]=Ae,P[2]=Me,P[3]=de,m.clearBufferuiv(m.COLOR,0,P)):(M[0]=Se,M[1]=Ae,M[2]=Me,M[3]=de,m.clearBufferiv(m.COLOR,0,M))}else I|=m.COLOR_BUFFER_BIT}E&&(I|=m.DEPTH_BUFFER_BIT),y&&(I|=m.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),m.clear(I)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",be,!1),t.removeEventListener("webglcontextrestored",$e,!1),t.removeEventListener("webglcontextcreationerror",Ve,!1),ne.dispose(),Q.dispose(),ie.dispose(),r.dispose(),H.dispose(),Y.dispose(),te.dispose(),le.dispose(),Z.dispose(),he.dispose(),ee.dispose(),ee.removeEventListener("sessionstart",Mr),ee.removeEventListener("sessionend",Tr),Ot.stop()};function be(s){s.preventDefault(),qi("WebGLRenderer: Context Lost."),p=!0}function $e(){qi("WebGLRenderer: Context Restored."),p=!1;let s=u.autoReset,E=_e.enabled,y=_e.autoUpdate,I=_e.needsUpdate,D=_e.type;X(),u.autoReset=s,_e.enabled=E,_e.autoUpdate=y,_e.needsUpdate=I,_e.type=D}function Ve(s){Qe("WebGLRenderer: A WebGL context could not be created. Reason: ",s.statusMessage)}function Mt(s){let E=s.target;E.removeEventListener("dispose",Mt),Pt(E)}function Pt(s){vo(s),r.remove(s)}function vo(s){let E=r.get(s).programs;E!==void 0&&(E.forEach(function(y){he.releaseProgram(y)}),s.isShaderMaterial&&he.releaseShaderCache(s))}this.renderBufferDirect=function(s,E,y,I,D,re){E===null&&(E=Xe);let ce=D.isMesh&&D.matrixWorld.determinant()<0,oe=Eo(s,E,y,I,D);me.setMaterial(I,ce);let de=y.index,Se=1;if(I.wireframe===!0){if(de=ve.getWireframeAttribute(y),de===void 0)return;Se=2}let Ae=y.drawRange,Me=y.attributes.position,Ue=Ae.start*Se,We=(Ae.start+Ae.count)*Se;re!==null&&(Ue=Math.max(Ue,re.start*Se),We=Math.min(We,(re.start+re.count)*Se)),de!==null?(Ue=Math.max(Ue,0),We=Math.min(We,de.count)):Me!=null&&(Ue=Math.max(Ue,0),We=Math.min(We,Me.count));let et=We-Ue;if(et<0||et===1/0)return;le.setup(D,I,oe,y,de);let tt,Ye=_;if(de!==null&&(tt=F.get(de),Ye=se,Ye.setIndex(tt)),D.isMesh)I.wireframe===!0?(me.setLineWidth(I.wireframeLinewidth*rt()),Ye.setMode(m.LINES)):Ye.setMode(m.TRIANGLES);else if(D.isLine){let Te=I.linewidth;Te===void 0&&(Te=1),me.setLineWidth(Te*rt()),D.isLineSegments?Ye.setMode(m.LINES):D.isLineLoop?Ye.setMode(m.LINE_LOOP):Ye.setMode(m.LINE_STRIP)}else D.isPoints?Ye.setMode(m.POINTS):D.isSprite&&Ye.setMode(m.TRIANGLES);if(D.isBatchedMesh)if(D._multiDrawInstances!==null)Gn("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Ye.renderMultiDrawInstances(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount,D._multiDrawInstances);else if(Ge.get("WEBGL_multi_draw"))Ye.renderMultiDraw(D._multiDrawStarts,D._multiDrawCounts,D._multiDrawCount);else{let Te=D._multiDrawStarts,ke=D._multiDrawCounts,Fe=D._multiDrawCount,mt=de?F.get(de).bytesPerElement:1,qt=r.get(I).currentProgram.getUniforms();for(let _t=0;_t<Fe;_t++)qt.setValue(m,"_gl_DrawID",_t),Ye.render(Te[_t]/mt,ke[_t])}else if(D.isInstancedMesh)Ye.renderInstances(Ue,et,D.count);else if(y.isInstancedBufferGeometry){let Te=y._maxInstanceCount!==void 0?y._maxInstanceCount:1/0,ke=Math.min(y.instanceCount,Te);Ye.renderInstances(Ue,et,ke)}else Ye.render(Ue,et)};function xr(s,E,y){s.transparent===!0&&s.side===Tt&&s.forceSinglePass===!1?(s.side=gt,s.needsUpdate=!0,xn(s,E,y),s.side=$t,s.needsUpdate=!0,xn(s,E,y),s.side=Tt):xn(s,E,y)}this.compile=function(s,E,y=null){y===null&&(y=s),C=ie.get(y),C.init(E),N.push(C),y.traverseVisible(function(D){D.isLight&&D.layers.test(E.layers)&&(C.pushLight(D),D.castShadow&&C.pushShadow(D))}),s!==y&&s.traverseVisible(function(D){D.isLight&&D.layers.test(E.layers)&&(C.pushLight(D),D.castShadow&&C.pushShadow(D))}),C.setupLights();let I=new Set;return s.traverse(function(D){if(!(D.isMesh||D.isPoints||D.isLine||D.isSprite))return;let re=D.material;if(re)if(Array.isArray(re))for(let ce=0;ce<re.length;ce++){let oe=re[ce];xr(oe,y,D),I.add(oe)}else xr(re,y,D),I.add(re)}),C=N.pop(),I},this.compileAsync=function(s,E,y=null){let I=this.compile(s,E,y);return new Promise(D=>{function re(){if(I.forEach(function(ce){r.get(ce).currentProgram.isReady()&&I.delete(ce)}),I.size===0){D(s);return}setTimeout(re,10)}Ge.get("KHR_parallel_shader_compile")!==null?re():setTimeout(re,10)})};let Yn=null;function So(s){Yn&&Yn(s)}function Mr(){Ot.stop()}function Tr(){Ot.start()}let Ot=new po;Ot.setAnimationLoop(So),typeof self<"u"&&Ot.setContext(self),this.setAnimationLoop=function(s){Yn=s,ee.setAnimationLoop(s),s===null?Ot.stop():Ot.start()},ee.addEventListener("sessionstart",Mr),ee.addEventListener("sessionend",Tr),this.render=function(s,E){if(E!==void 0&&E.isCamera!==!0){Qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(p===!0)return;let y=ee.enabled===!0&&ee.isPresenting===!0,I=q!==null&&(G===null||y)&&q.begin(c,G);if(s.matrixWorldAutoUpdate===!0&&s.updateMatrixWorld(),E.parent===null&&E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),ee.enabled===!0&&ee.isPresenting===!0&&(q===null||q.isCompositing()===!1)&&(ee.cameraAutoUpdate===!0&&ee.updateCamera(E),E=ee.getCamera()),s.isScene===!0&&s.onBeforeRender(c,s,E,G),C=ie.get(s,N.length),C.init(E),N.push(C),lt.multiplyMatrices(E.projectionMatrix,E.matrixWorldInverse),Ce.setFromProjectionMatrix(lt,Yi,E.reversedDepth),ye=this.localClippingEnabled,pe=ue.init(this.clippingPlanes,ye),A=Q.get(s,T.length),A.init(),T.push(A),ee.enabled===!0&&ee.isPresenting===!0){let ce=c.xr.getDepthSensingMesh();ce!==null&&qn(ce,E,-1/0,c.sortObjects)}qn(s,E,0,c.sortObjects),A.finish(),c.sortObjects===!0&&A.sort(it,je),Le=ee.enabled===!1||ee.isPresenting===!1||ee.hasDepthSensing()===!1,Le&&ne.addToRenderList(A,s),this.info.render.frame++,pe===!0&&ue.beginShadows();let D=C.state.shadowsArray;if(_e.render(D,s,E),pe===!0&&ue.endShadows(),this.info.autoReset===!0&&this.info.reset(),(I&&q.hasRenderPass())===!1){let ce=A.opaque,oe=A.transmissive;if(C.setupLights(),E.isArrayCamera){let de=E.cameras;if(oe.length>0)for(let Se=0,Ae=de.length;Se<Ae;Se++){let Me=de[Se];Rr(ce,oe,s,Me)}Le&&ne.render(s);for(let Se=0,Ae=de.length;Se<Ae;Se++){let Me=de[Se];Ar(A,s,Me,Me.viewport)}}else oe.length>0&&Rr(ce,oe,s,E),Le&&ne.render(s),Ar(A,s,E)}G!==null&&k===0&&(v.updateMultisampleRenderTarget(G),v.updateRenderTargetMipmap(G)),I&&q.end(c),s.isScene===!0&&s.onAfterRender(c,s,E),le.resetDefaultState(),z=-1,K=null,N.pop(),N.length>0?(C=N[N.length-1],pe===!0&&ue.setGlobalState(c.clippingPlanes,C.state.camera)):C=null,T.pop(),T.length>0?A=T[T.length-1]:A=null};function qn(s,E,y,I){if(s.visible===!1)return;if(s.layers.test(E.layers)){if(s.isGroup)y=s.renderOrder;else if(s.isLOD)s.autoUpdate===!0&&s.update(E);else if(s.isLight)C.pushLight(s),s.castShadow&&C.pushShadow(s);else if(s.isSprite){if(!s.frustumCulled||Ce.intersectsSprite(s)){I&&He.setFromMatrixPosition(s.matrixWorld).applyMatrix4(lt);let ce=te.update(s),oe=s.material;oe.visible&&A.push(s,ce,oe,y,He.z,null)}}else if((s.isMesh||s.isLine||s.isPoints)&&(!s.frustumCulled||Ce.intersectsObject(s))){let ce=te.update(s),oe=s.material;if(I&&(s.boundingSphere!==void 0?(s.boundingSphere===null&&s.computeBoundingSphere(),He.copy(s.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),He.copy(ce.boundingSphere.center)),He.applyMatrix4(s.matrixWorld).applyMatrix4(lt)),Array.isArray(oe)){let de=ce.groups;for(let Se=0,Ae=de.length;Se<Ae;Se++){let Me=de[Se],Ue=oe[Me.materialIndex];Ue&&Ue.visible&&A.push(s,ce,Ue,y,He.z,Me)}}else oe.visible&&A.push(s,ce,oe,y,He.z,null)}}let re=s.children;for(let ce=0,oe=re.length;ce<oe;ce++)qn(re[ce],E,y,I)}function Ar(s,E,y,I){let{opaque:D,transmissive:re,transparent:ce}=s;C.setupLightsView(y),pe===!0&&ue.setGlobalState(c.clippingPlanes,y),I&&me.viewport(B.copy(I)),D.length>0&&En(D,E,y),re.length>0&&En(re,E,y),ce.length>0&&En(ce,E,y),me.buffers.depth.setTest(!0),me.buffers.depth.setMask(!0),me.buffers.color.setMask(!0),me.setPolygonOffset(!1)}function Rr(s,E,y,I){if((y.isScene===!0?y.overrideMaterial:null)!==null)return;if(C.state.transmissionRenderTarget[I.id]===void 0){let Ue=Ge.has("EXT_color_buffer_half_float")||Ge.has("EXT_color_buffer_float");C.state.transmissionRenderTarget[I.id]=new Rt(1,1,{generateMipmaps:!0,type:Ue?Ut:xt,minFilter:Jt,samples:Ke.samples,stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace})}let re=C.state.transmissionRenderTarget[I.id],ce=I.viewport||B;re.setSize(ce.z*c.transmissionResolutionScale,ce.w*c.transmissionResolutionScale);let oe=c.getRenderTarget(),de=c.getActiveCubeFace(),Se=c.getActiveMipmapLevel();c.setRenderTarget(re),c.getClearColor(xe),ge=c.getClearAlpha(),ge<1&&c.setClearColor(16777215,.5),c.clear(),Le&&ne.render(y);let Ae=c.toneMapping;c.toneMapping=Et;let Me=I.viewport;if(I.viewport!==void 0&&(I.viewport=void 0),C.setupLightsView(I),pe===!0&&ue.setGlobalState(c.clippingPlanes,I),En(s,y,I),v.updateMultisampleRenderTarget(re),v.updateRenderTargetMipmap(re),Ge.has("WEBGL_multisampled_render_to_texture")===!1){let Ue=!1;for(let We=0,et=E.length;We<et;We++){let tt=E[We],{object:Ye,geometry:Te,material:ke,group:Fe}=tt;if(ke.side===Tt&&Ye.layers.test(I.layers)){let mt=ke.side;ke.side=gt,ke.needsUpdate=!0,br(Ye,y,I,Te,ke,Fe),ke.side=mt,ke.needsUpdate=!0,Ue=!0}}Ue===!0&&(v.updateMultisampleRenderTarget(re),v.updateRenderTargetMipmap(re))}c.setRenderTarget(oe,de,Se),c.setClearColor(xe,ge),Me!==void 0&&(I.viewport=Me),c.toneMapping=Ae}function En(s,E,y){let I=E.isScene===!0?E.overrideMaterial:null;for(let D=0,re=s.length;D<re;D++){let ce=s[D],{object:oe,geometry:de,group:Se}=ce,Ae=ce.material;Ae.allowOverride===!0&&I!==null&&(Ae=I),oe.layers.test(y.layers)&&br(oe,E,y,de,Ae,Se)}}function br(s,E,y,I,D,re){s.onBeforeRender(c,E,y,I,D,re),s.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,s.matrixWorld),s.normalMatrix.getNormalMatrix(s.modelViewMatrix),D.onBeforeRender(c,E,y,I,s,re),D.transparent===!0&&D.side===Tt&&D.forceSinglePass===!1?(D.side=gt,D.needsUpdate=!0,c.renderBufferDirect(y,E,I,D,s,re),D.side=$t,D.needsUpdate=!0,c.renderBufferDirect(y,E,I,D,s,re),D.side=Tt):c.renderBufferDirect(y,E,I,D,s,re),s.onAfterRender(c,E,y,I,D,re)}function xn(s,E,y){E.isScene!==!0&&(E=Xe);let I=r.get(s),D=C.state.lights,re=C.state.shadowsArray,ce=D.state.version,oe=he.getParameters(s,D.state,re,E,y),de=he.getProgramCacheKey(oe),Se=I.programs;I.environment=s.isMeshStandardMaterial?E.environment:null,I.fog=E.fog,I.envMap=(s.isMeshStandardMaterial?Y:H).get(s.envMap||I.environment),I.envMapRotation=I.environment!==null&&s.envMap===null?E.environmentRotation:s.envMapRotation,Se===void 0&&(s.addEventListener("dispose",Mt),Se=new Map,I.programs=Se);let Ae=Se.get(de);if(Ae!==void 0){if(I.currentProgram===Ae&&I.lightsStateVersion===ce)return Pr(s,oe),Ae}else oe.uniforms=he.getUniforms(s),s.onBeforeCompile(oe,c),Ae=he.acquireProgram(oe,de),Se.set(de,Ae),I.uniforms=oe.uniforms;let Me=I.uniforms;return(!s.isShaderMaterial&&!s.isRawShaderMaterial||s.clipping===!0)&&(Me.clippingPlanes=ue.uniform),Pr(s,oe),I.needsLights=Mo(s),I.lightsStateVersion=ce,I.needsLights&&(Me.ambientLightColor.value=D.state.ambient,Me.lightProbe.value=D.state.probe,Me.directionalLights.value=D.state.directional,Me.directionalLightShadows.value=D.state.directionalShadow,Me.spotLights.value=D.state.spot,Me.spotLightShadows.value=D.state.spotShadow,Me.rectAreaLights.value=D.state.rectArea,Me.ltc_1.value=D.state.rectAreaLTC1,Me.ltc_2.value=D.state.rectAreaLTC2,Me.pointLights.value=D.state.point,Me.pointLightShadows.value=D.state.pointShadow,Me.hemisphereLights.value=D.state.hemi,Me.directionalShadowMap.value=D.state.directionalShadowMap,Me.directionalShadowMatrix.value=D.state.directionalShadowMatrix,Me.spotShadowMap.value=D.state.spotShadowMap,Me.spotLightMatrix.value=D.state.spotLightMatrix,Me.spotLightMap.value=D.state.spotLightMap,Me.pointShadowMap.value=D.state.pointShadowMap,Me.pointShadowMatrix.value=D.state.pointShadowMatrix),I.currentProgram=Ae,I.uniformsList=null,Ae}function Cr(s){if(s.uniformsList===null){let E=s.currentProgram.getUniforms();s.uniformsList=nn.seqWithValue(E.seq,s.uniforms)}return s.uniformsList}function Pr(s,E){let y=r.get(s);y.outputColorSpace=E.outputColorSpace,y.batching=E.batching,y.batchingColor=E.batchingColor,y.instancing=E.instancing,y.instancingColor=E.instancingColor,y.instancingMorph=E.instancingMorph,y.skinning=E.skinning,y.morphTargets=E.morphTargets,y.morphNormals=E.morphNormals,y.morphColors=E.morphColors,y.morphTargetsCount=E.morphTargetsCount,y.numClippingPlanes=E.numClippingPlanes,y.numIntersection=E.numClipIntersection,y.vertexAlphas=E.vertexAlphas,y.vertexTangents=E.vertexTangents,y.toneMapping=E.toneMapping}function Eo(s,E,y,I,D){E.isScene!==!0&&(E=Xe),v.resetTextureUnits();let re=E.fog,ce=I.isMeshStandardMaterial?E.environment:null,oe=G===null?c.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:un,de=(I.isMeshStandardMaterial?Y:H).get(I.envMap||ce),Se=I.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,Ae=!!y.attributes.tangent&&(!!I.normalMap||I.anisotropy>0),Me=!!y.morphAttributes.position,Ue=!!y.morphAttributes.normal,We=!!y.morphAttributes.color,et=Et;I.toneMapped&&(G===null||G.isXRRenderTarget===!0)&&(et=c.toneMapping);let tt=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,Ye=tt!==void 0?tt.length:0,Te=r.get(I),ke=C.state.lights;if(pe===!0&&(ye===!0||s!==K)){let ct=s===K&&I.id===z;ue.setState(I,s,ct)}let Fe=!1;I.version===Te.__version?(Te.needsLights&&Te.lightsStateVersion!==ke.state.version||Te.outputColorSpace!==oe||D.isBatchedMesh&&Te.batching===!1||!D.isBatchedMesh&&Te.batching===!0||D.isBatchedMesh&&Te.batchingColor===!0&&D.colorTexture===null||D.isBatchedMesh&&Te.batchingColor===!1&&D.colorTexture!==null||D.isInstancedMesh&&Te.instancing===!1||!D.isInstancedMesh&&Te.instancing===!0||D.isSkinnedMesh&&Te.skinning===!1||!D.isSkinnedMesh&&Te.skinning===!0||D.isInstancedMesh&&Te.instancingColor===!0&&D.instanceColor===null||D.isInstancedMesh&&Te.instancingColor===!1&&D.instanceColor!==null||D.isInstancedMesh&&Te.instancingMorph===!0&&D.morphTexture===null||D.isInstancedMesh&&Te.instancingMorph===!1&&D.morphTexture!==null||Te.envMap!==de||I.fog===!0&&Te.fog!==re||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==ue.numPlanes||Te.numIntersection!==ue.numIntersection)||Te.vertexAlphas!==Se||Te.vertexTangents!==Ae||Te.morphTargets!==Me||Te.morphNormals!==Ue||Te.morphColors!==We||Te.toneMapping!==et||Te.morphTargetsCount!==Ye)&&(Fe=!0):(Fe=!0,Te.__version=I.version);let mt=Te.currentProgram;Fe===!0&&(mt=xn(I,E,D));let qt=!1,_t=!1,an=!1,Ze=mt.getUniforms(),pt=Te.uniforms;if(me.useProgram(mt.program)&&(qt=!0,_t=!0,an=!0),I.id!==z&&(z=I.id,_t=!0),qt||K!==s){me.buffers.depth.getReversed()&&s.reversedDepth!==!0&&(s._reversedDepth=!0,s.updateProjectionMatrix()),Ze.setValue(m,"projectionMatrix",s.projectionMatrix),Ze.setValue(m,"viewMatrix",s.matrixWorldInverse);let ht=Ze.map.cameraPosition;ht!==void 0&&ht.setValue(m,Ie.setFromMatrixPosition(s.matrixWorld)),Ke.logarithmicDepthBuffer&&Ze.setValue(m,"logDepthBufFC",2/(Math.log(s.far+1)/Math.LN2)),(I.isMeshPhongMaterial||I.isMeshToonMaterial||I.isMeshLambertMaterial||I.isMeshBasicMaterial||I.isMeshStandardMaterial||I.isShaderMaterial)&&Ze.setValue(m,"isOrthographic",s.isOrthographicCamera===!0),K!==s&&(K=s,_t=!0,an=!0)}if(Te.needsLights&&(ke.state.directionalShadowMap.length>0&&Ze.setValue(m,"directionalShadowMap",ke.state.directionalShadowMap,v),ke.state.spotShadowMap.length>0&&Ze.setValue(m,"spotShadowMap",ke.state.spotShadowMap,v),ke.state.pointShadowMap.length>0&&Ze.setValue(m,"pointShadowMap",ke.state.pointShadowMap,v)),D.isSkinnedMesh){Ze.setOptional(m,D,"bindMatrix"),Ze.setOptional(m,D,"bindMatrixInverse");let ct=D.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),Ze.setValue(m,"boneTexture",ct.boneTexture,v))}D.isBatchedMesh&&(Ze.setOptional(m,D,"batchingTexture"),Ze.setValue(m,"batchingTexture",D._matricesTexture,v),Ze.setOptional(m,D,"batchingIdTexture"),Ze.setValue(m,"batchingIdTexture",D._indirectTexture,v),Ze.setOptional(m,D,"batchingColorTexture"),D._colorsTexture!==null&&Ze.setValue(m,"batchingColorTexture",D._colorsTexture,v));let St=y.morphAttributes;if((St.position!==void 0||St.normal!==void 0||St.color!==void 0)&&De.update(D,y,mt),(_t||Te.receiveShadow!==D.receiveShadow)&&(Te.receiveShadow=D.receiveShadow,Ze.setValue(m,"receiveShadow",D.receiveShadow)),I.isMeshGouraudMaterial&&I.envMap!==null&&(pt.envMap.value=de,pt.flipEnvMap.value=de.isCubeTexture&&de.isRenderTargetTexture===!1?-1:1),I.isMeshStandardMaterial&&I.envMap===null&&E.environment!==null&&(pt.envMapIntensity.value=E.environmentIntensity),pt.dfgLUT!==void 0&&(pt.dfgLUT.value=pd()),_t&&(Ze.setValue(m,"toneMappingExposure",c.toneMappingExposure),Te.needsLights&&xo(pt,an),re&&I.fog===!0&&Re.refreshFogUniforms(pt,re),Re.refreshMaterialUniforms(pt,I,we,Be,C.state.transmissionRenderTarget[s.id]),nn.upload(m,Cr(Te),pt,v)),I.isShaderMaterial&&I.uniformsNeedUpdate===!0&&(nn.upload(m,Cr(Te),pt,v),I.uniformsNeedUpdate=!1),I.isSpriteMaterial&&Ze.setValue(m,"center",D.center),Ze.setValue(m,"modelViewMatrix",D.modelViewMatrix),Ze.setValue(m,"normalMatrix",D.normalMatrix),Ze.setValue(m,"modelMatrix",D.matrixWorld),I.isShaderMaterial||I.isRawShaderMaterial){let ct=I.uniformsGroups;for(let ht=0,Kn=ct.length;ht<Kn;ht++){let Bt=ct[ht];Z.update(Bt,mt),Z.bind(Bt,mt)}}return mt}function xo(s,E){s.ambientLightColor.needsUpdate=E,s.lightProbe.needsUpdate=E,s.directionalLights.needsUpdate=E,s.directionalLightShadows.needsUpdate=E,s.pointLights.needsUpdate=E,s.pointLightShadows.needsUpdate=E,s.spotLights.needsUpdate=E,s.spotLightShadows.needsUpdate=E,s.rectAreaLights.needsUpdate=E,s.hemisphereLights.needsUpdate=E}function Mo(s){return s.isMeshLambertMaterial||s.isMeshToonMaterial||s.isMeshPhongMaterial||s.isMeshStandardMaterial||s.isShadowMaterial||s.isShaderMaterial&&s.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return G},this.setRenderTargetTextures=function(s,E,y){let I=r.get(s);I.__autoAllocateDepthBuffer=s.resolveDepthBuffer===!1,I.__autoAllocateDepthBuffer===!1&&(I.__useRenderToTexture=!1),r.get(s.texture).__webglTexture=E,r.get(s.depthTexture).__webglTexture=I.__autoAllocateDepthBuffer?void 0:y,I.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(s,E){let y=r.get(s);y.__webglFramebuffer=E,y.__useDefaultFramebuffer=E===void 0};let To=m.createFramebuffer();this.setRenderTarget=function(s,E=0,y=0){G=s,L=E,k=y;let I=null,D=!1,re=!1;if(s){let oe=r.get(s);if(oe.__useDefaultFramebuffer!==void 0){me.bindFramebuffer(m.FRAMEBUFFER,oe.__webglFramebuffer),B.copy(s.viewport),V.copy(s.scissor),J=s.scissorTest,me.viewport(B),me.scissor(V),me.setScissorTest(J),z=-1;return}else if(oe.__webglFramebuffer===void 0)v.setupRenderTarget(s);else if(oe.__hasExternalTextures)v.rebindTextures(s,r.get(s.texture).__webglTexture,r.get(s.depthTexture).__webglTexture);else if(s.depthBuffer){let Ae=s.depthTexture;if(oe.__boundDepthTexture!==Ae){if(Ae!==null&&r.has(Ae)&&(s.width!==Ae.image.width||s.height!==Ae.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");v.setupDepthRenderbuffer(s)}}let de=s.texture;(de.isData3DTexture||de.isDataArrayTexture||de.isCompressedArrayTexture)&&(re=!0);let Se=r.get(s).__webglFramebuffer;s.isWebGLCubeRenderTarget?(Array.isArray(Se[E])?I=Se[E][y]:I=Se[E],D=!0):s.samples>0&&v.useMultisampledRTT(s)===!1?I=r.get(s).__webglMultisampledFramebuffer:Array.isArray(Se)?I=Se[y]:I=Se,B.copy(s.viewport),V.copy(s.scissor),J=s.scissorTest}else B.copy(W).multiplyScalar(we).floor(),V.copy($).multiplyScalar(we).floor(),J=fe;if(y!==0&&(I=To),me.bindFramebuffer(m.FRAMEBUFFER,I)&&me.drawBuffers(s,I),me.viewport(B),me.scissor(V),me.setScissorTest(J),D){let oe=r.get(s.texture);m.framebufferTexture2D(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_CUBE_MAP_POSITIVE_X+E,oe.__webglTexture,y)}else if(re){let oe=E;for(let de=0;de<s.textures.length;de++){let Se=r.get(s.textures[de]);m.framebufferTextureLayer(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0+de,Se.__webglTexture,y,oe)}}else if(s!==null&&y!==0){let oe=r.get(s.texture);m.framebufferTexture2D(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,oe.__webglTexture,y)}z=-1},this.readRenderTargetPixels=function(s,E,y,I,D,re,ce,oe=0){if(!(s&&s.isWebGLRenderTarget)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let de=r.get(s).__webglFramebuffer;if(s.isWebGLCubeRenderTarget&&ce!==void 0&&(de=de[ce]),de){me.bindFramebuffer(m.FRAMEBUFFER,de);try{let Se=s.textures[oe],Ae=Se.format,Me=Se.type;if(!Ke.textureFormatReadable(Ae)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ke.textureTypeReadable(Me)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}E>=0&&E<=s.width-I&&y>=0&&y<=s.height-D&&(s.textures.length>1&&m.readBuffer(m.COLOR_ATTACHMENT0+oe),m.readPixels(E,y,I,D,j.convert(Ae),j.convert(Me),re))}finally{let Se=G!==null?r.get(G).__webglFramebuffer:null;me.bindFramebuffer(m.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(s,E,y,I,D,re,ce,oe=0){if(!(s&&s.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let de=r.get(s).__webglFramebuffer;if(s.isWebGLCubeRenderTarget&&ce!==void 0&&(de=de[ce]),de)if(E>=0&&E<=s.width-I&&y>=0&&y<=s.height-D){me.bindFramebuffer(m.FRAMEBUFFER,de);let Se=s.textures[oe],Ae=Se.format,Me=Se.type;if(!Ke.textureFormatReadable(Ae))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ke.textureTypeReadable(Me))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ue=m.createBuffer();m.bindBuffer(m.PIXEL_PACK_BUFFER,Ue),m.bufferData(m.PIXEL_PACK_BUFFER,re.byteLength,m.STREAM_READ),s.textures.length>1&&m.readBuffer(m.COLOR_ATTACHMENT0+oe),m.readPixels(E,y,I,D,j.convert(Ae),j.convert(Me),0);let We=G!==null?r.get(G).__webglFramebuffer:null;me.bindFramebuffer(m.FRAMEBUFFER,We);let et=m.fenceSync(m.SYNC_GPU_COMMANDS_COMPLETE,0);return m.flush(),await Ra(m,et,4),m.bindBuffer(m.PIXEL_PACK_BUFFER,Ue),m.getBufferSubData(m.PIXEL_PACK_BUFFER,0,re),m.deleteBuffer(Ue),m.deleteSync(et),re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(s,E=null,y=0){let I=Math.pow(2,-y),D=Math.floor(s.image.width*I),re=Math.floor(s.image.height*I),ce=E!==null?E.x:0,oe=E!==null?E.y:0;v.setTexture2D(s,0),m.copyTexSubImage2D(m.TEXTURE_2D,y,0,0,ce,oe,D,re),me.unbindTexture()};let Ao=m.createFramebuffer(),Ro=m.createFramebuffer();this.copyTextureToTexture=function(s,E,y=null,I=null,D=0,re=null){re===null&&(D!==0?(Gn("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),re=D,D=0):re=0);let ce,oe,de,Se,Ae,Me,Ue,We,et,tt=s.isCompressedTexture?s.mipmaps[re]:s.image;if(y!==null)ce=y.max.x-y.min.x,oe=y.max.y-y.min.y,de=y.isBox3?y.max.z-y.min.z:1,Se=y.min.x,Ae=y.min.y,Me=y.isBox3?y.min.z:0;else{let St=Math.pow(2,-D);ce=Math.floor(tt.width*St),oe=Math.floor(tt.height*St),s.isDataArrayTexture?de=tt.depth:s.isData3DTexture?de=Math.floor(tt.depth*St):de=1,Se=0,Ae=0,Me=0}I!==null?(Ue=I.x,We=I.y,et=I.z):(Ue=0,We=0,et=0);let Ye=j.convert(E.format),Te=j.convert(E.type),ke;E.isData3DTexture?(v.setTexture3D(E,0),ke=m.TEXTURE_3D):E.isDataArrayTexture||E.isCompressedArrayTexture?(v.setTexture2DArray(E,0),ke=m.TEXTURE_2D_ARRAY):(v.setTexture2D(E,0),ke=m.TEXTURE_2D),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,E.flipY),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),m.pixelStorei(m.UNPACK_ALIGNMENT,E.unpackAlignment);let Fe=m.getParameter(m.UNPACK_ROW_LENGTH),mt=m.getParameter(m.UNPACK_IMAGE_HEIGHT),qt=m.getParameter(m.UNPACK_SKIP_PIXELS),_t=m.getParameter(m.UNPACK_SKIP_ROWS),an=m.getParameter(m.UNPACK_SKIP_IMAGES);m.pixelStorei(m.UNPACK_ROW_LENGTH,tt.width),m.pixelStorei(m.UNPACK_IMAGE_HEIGHT,tt.height),m.pixelStorei(m.UNPACK_SKIP_PIXELS,Se),m.pixelStorei(m.UNPACK_SKIP_ROWS,Ae),m.pixelStorei(m.UNPACK_SKIP_IMAGES,Me);let Ze=s.isDataArrayTexture||s.isData3DTexture,pt=E.isDataArrayTexture||E.isData3DTexture;if(s.isDepthTexture){let St=r.get(s),ct=r.get(E),ht=r.get(St.__renderTarget),Kn=r.get(ct.__renderTarget);me.bindFramebuffer(m.READ_FRAMEBUFFER,ht.__webglFramebuffer),me.bindFramebuffer(m.DRAW_FRAMEBUFFER,Kn.__webglFramebuffer);for(let Bt=0;Bt<de;Bt++)Ze&&(m.framebufferTextureLayer(m.READ_FRAMEBUFFER,m.COLOR_ATTACHMENT0,r.get(s).__webglTexture,D,Me+Bt),m.framebufferTextureLayer(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0,r.get(E).__webglTexture,re,et+Bt)),m.blitFramebuffer(Se,Ae,ce,oe,Ue,We,ce,oe,m.DEPTH_BUFFER_BIT,m.NEAREST);me.bindFramebuffer(m.READ_FRAMEBUFFER,null),me.bindFramebuffer(m.DRAW_FRAMEBUFFER,null)}else if(D!==0||s.isRenderTargetTexture||r.has(s)){let St=r.get(s),ct=r.get(E);me.bindFramebuffer(m.READ_FRAMEBUFFER,Ao),me.bindFramebuffer(m.DRAW_FRAMEBUFFER,Ro);for(let ht=0;ht<de;ht++)Ze?m.framebufferTextureLayer(m.READ_FRAMEBUFFER,m.COLOR_ATTACHMENT0,St.__webglTexture,D,Me+ht):m.framebufferTexture2D(m.READ_FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,St.__webglTexture,D),pt?m.framebufferTextureLayer(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0,ct.__webglTexture,re,et+ht):m.framebufferTexture2D(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,ct.__webglTexture,re),D!==0?m.blitFramebuffer(Se,Ae,ce,oe,Ue,We,ce,oe,m.COLOR_BUFFER_BIT,m.NEAREST):pt?m.copyTexSubImage3D(ke,re,Ue,We,et+ht,Se,Ae,ce,oe):m.copyTexSubImage2D(ke,re,Ue,We,Se,Ae,ce,oe);me.bindFramebuffer(m.READ_FRAMEBUFFER,null),me.bindFramebuffer(m.DRAW_FRAMEBUFFER,null)}else pt?s.isDataTexture||s.isData3DTexture?m.texSubImage3D(ke,re,Ue,We,et,ce,oe,de,Ye,Te,tt.data):E.isCompressedArrayTexture?m.compressedTexSubImage3D(ke,re,Ue,We,et,ce,oe,de,Ye,tt.data):m.texSubImage3D(ke,re,Ue,We,et,ce,oe,de,Ye,Te,tt):s.isDataTexture?m.texSubImage2D(m.TEXTURE_2D,re,Ue,We,ce,oe,Ye,Te,tt.data):s.isCompressedTexture?m.compressedTexSubImage2D(m.TEXTURE_2D,re,Ue,We,tt.width,tt.height,Ye,tt.data):m.texSubImage2D(m.TEXTURE_2D,re,Ue,We,ce,oe,Ye,Te,tt);m.pixelStorei(m.UNPACK_ROW_LENGTH,Fe),m.pixelStorei(m.UNPACK_IMAGE_HEIGHT,mt),m.pixelStorei(m.UNPACK_SKIP_PIXELS,qt),m.pixelStorei(m.UNPACK_SKIP_ROWS,_t),m.pixelStorei(m.UNPACK_SKIP_IMAGES,an),re===0&&E.generateMipmaps&&m.generateMipmap(ke),me.unbindTexture()},this.initRenderTarget=function(s){r.get(s).__webglFramebuffer===void 0&&v.setupRenderTarget(s)},this.initTexture=function(s){s.isCubeTexture?v.setTextureCube(s,0):s.isData3DTexture?v.setTexture3D(s,0):s.isDataArrayTexture||s.isCompressedArrayTexture?v.setTexture2DArray(s,0):v.setTexture2D(s,0),me.unbindTexture()},this.resetState=function(){L=0,k=0,G=null,me.reset(),le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n;let t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(n),t.unpackColorSpace=nt._getUnpackColorSpace()}};export{Pe as a,ae as b,Ct as c,Wn as d,od as e,uo as f};
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
//# sourceMappingURL=chunk-ZFOR672D.js.map
