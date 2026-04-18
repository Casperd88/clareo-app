import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { File as ExpoFile } from 'expo-file-system';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ShaderBackgroundProps {
  imageSource?: number | { uri: string };
}

function buildHTML(base64: string): string {
  return `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<style>*{margin:0;padding:0}html,body,canvas{width:100%;height:100%;display:block;overflow:hidden}</style>
</head><body><canvas id="c"></canvas><canvas id="s" style="display:none"></canvas><script>
(function(){
var img=new Image();
img.onload=function(){
  var sc=document.getElementById("s");sc.width=32;sc.height=32;
  var ctx=sc.getContext("2d");ctx.drawImage(img,0,0,32,32);
  var d=ctx.getImageData(0,0,32,32).data;
  var px=[];
  for(var i=0;i<d.length;i+=4){
    var r=d[i],g=d[i+1],b=d[i+2],lum=0.299*r+0.587*g+0.114*b;
    if(lum>30&&lum<230) px.push([r,g,b]);
  }
  if(px.length<10) for(var i=0;i<d.length;i+=4) px.push([d[i],d[i+1],d[i+2]]);
  var cols=kmeans(px,3);
  run(cols.map(function(c){
    var r=c[0]/255,g=c[1]/255,b=c[2]/255;
    var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;
    if(mx!==mn){var d=mx-mn,s=l>0.5?d/(2-mx-mn):d/(mx+mn);
      var boost=1.6;s=Math.min(s*boost,1);
      function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
      var h;if(mx===r)h=((g-b)/d+(g<b?6:0))/6;else if(mx===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;
      var q=l<0.5?l*(1+s):l+s-l*s,p2=2*l-q;
      r=hue2rgb(p2,q,h+1/3);g=hue2rgb(p2,q,h);b=hue2rgb(p2,q,h-1/3);
    }
    return[r,g,b];
  }));
};
img.src="data:image/png;base64,${base64}";

function kmeans(px,k){
  var cen=[px[0].slice()];
  for(var i=1;i<k;i++){
    var mx=0,best=px[0];
    for(var j=0;j<px.length;j++){
      var mn=1e9;
      for(var ci=0;ci<cen.length;ci++){
        var dx=px[j][0]-cen[ci][0],dy=px[j][1]-cen[ci][1],dz=px[j][2]-cen[ci][2];
        mn=Math.min(mn,dx*dx+dy*dy+dz*dz);
      }
      if(mn>mx){mx=mn;best=px[j];}
    }
    cen.push(best.slice());
  }
  for(var it=0;it<12;it++){
    var sums=[];for(var ci=0;ci<k;ci++) sums.push([0,0,0,0]);
    for(var j=0;j<px.length;j++){
      var mn=1e9,mi=0;
      for(var ci=0;ci<k;ci++){
        var dx=px[j][0]-cen[ci][0],dy=px[j][1]-cen[ci][1],dz=px[j][2]-cen[ci][2];
        var dist=dx*dx+dy*dy+dz*dz;
        if(dist<mn){mn=dist;mi=ci;}
      }
      sums[mi][0]+=px[j][0];sums[mi][1]+=px[j][1];sums[mi][2]+=px[j][2];sums[mi][3]++;
    }
    for(var ci=0;ci<k;ci++){
      if(sums[ci][3]>0){
        cen[ci]=[sums[ci][0]/sums[ci][3],sums[ci][1]/sums[ci][3],sums[ci][2]/sums[ci][3]];
      }
    }
  }
  return cen.map(function(c){return[Math.round(c[0]),Math.round(c[1]),Math.round(c[2])]});
}

function run(colors){
  var c=document.getElementById("c"),gl=c.getContext("webgl");
  if(!gl)return;
  function resize(){var d=Math.min(devicePixelRatio||1,2);c.width=c.clientWidth*d;c.height=c.clientHeight*d;gl.viewport(0,0,c.width,c.height)}
  var vs='attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}';
  var fs='precision mediump float;'+
'uniform vec2 u_resolution;uniform float u_time;'+
'uniform vec3 u_c1;uniform vec3 u_c2;uniform vec3 u_c3;'+
'vec3 mod289v(vec3 x){return x-floor(x/289.0)*289.0;}'+
'vec2 mod289f(vec2 x){return x-floor(x/289.0)*289.0;}'+
'vec3 permute(vec3 x){return mod289v((x*34.0+1.0)*x);}'+
'float snoise(vec2 v){'+
'vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);'+
'vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);'+
'vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);'+
'vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289f(i);'+
'vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));'+
'vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);'+
'm=m*m;m=m*m;'+
'vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;'+
'vec3 ox=floor(x+0.5);vec3 a0=x-ox;'+
'm*=1.79284291400159-0.85373472095314*(a0*a0+h*h);'+
'vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;'+
'return 130.0*dot(m,g);}'+
'float blob(vec2 uv,vec2 center,float radius,float t,float seed){'+
'vec2 d=uv-center;float angle=atan(d.y,d.x);'+
'float deform=1.0+0.18*sin(angle*3.0+t*1.2+seed)+0.12*sin(angle*5.0-t*0.9+seed*2.0)+0.09*sin(angle*7.0+t*1.5+seed*3.0);'+
'float dist=length(d)/(radius*deform);return smoothstep(1.0,0.0,dist);}'+
'void main(){'+
'vec2 uv=gl_FragCoord.xy/u_resolution;float aspect=u_resolution.x/u_resolution.y;'+
'vec2 p=vec2(uv.x*aspect,uv.y);float t=u_time*0.5;'+
'float n1=snoise(p*1.5+t*0.15)*0.035;float n2=snoise(p*2.5-t*0.1)*0.02;vec2 pn=p+n1+n2;'+
'vec2 c1=vec2(aspect*(0.3+0.25*sin(t*0.7+1.0)+0.08*cos(t*1.3)),0.72+0.2*cos(t*0.5)+0.06*sin(t*1.2));'+
'vec2 c2=vec2(aspect*(0.7+0.2*cos(t*0.6)+0.09*sin(t*1.4)),0.28+0.22*sin(t*0.9+2.0)+0.07*cos(t*1.1));'+
'vec2 c3=vec2(aspect*(0.5+0.22*sin(t*0.5+3.0)+0.1*cos(t*1.2+1.0)),0.5+0.18*cos(t*0.8+1.0)+0.08*sin(t*1.3));'+
'float r1=0.5+0.08*sin(t*0.7);float r2=0.46+0.09*cos(t*0.9+1.0);float r3=0.52+0.1*sin(t*0.6+2.0);'+
'float b1=blob(pn,c1,r1,t,0.0);float b2=blob(pn,c2,r2,t,12.0);float b3=blob(pn,c3,r3,t,24.0);'+
'vec3 bg=vec3(0.94,0.94,0.95);vec3 color=bg;'+
'color=mix(color,u_c1,b1*0.72);'+
'color=mix(color,u_c2,b2*0.66);'+
'color=mix(color,u_c3,b3*0.60);'+
'color=mix(bg,color,0.9+0.08*sin(u_time*0.3));'+
'float fadeIn=smoothstep(0.0,1.2,u_time);'+
'gl_FragColor=vec4(color,fadeIn);}';

  function mk(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  var v=mk(gl.VERTEX_SHADER,vs),f=mk(gl.FRAGMENT_SHADER,fs);
  var pg=gl.createProgram();gl.attachShader(pg,v);gl.attachShader(pg,f);gl.linkProgram(pg);gl.useProgram(pg);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var a=gl.getAttribLocation(pg,"a_position");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  var uR=gl.getUniformLocation(pg,"u_resolution"),uT=gl.getUniformLocation(pg,"u_time");
  var uC1=gl.getUniformLocation(pg,"u_c1"),uC2=gl.getUniformLocation(pg,"u_c2"),uC3=gl.getUniformLocation(pg,"u_c3");
  resize();window.addEventListener("resize",resize);
  gl.uniform3f(uC1,colors[0][0],colors[0][1],colors[0][2]);
  gl.uniform3f(uC2,colors[1][0],colors[1][1],colors[1][2]);
  gl.uniform3f(uC3,colors[2][0],colors[2][1],colors[2][2]);
  function frame(ts){gl.uniform2f(uR,c.width,c.height);gl.uniform1f(uT,ts*0.001);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(frame);}
  requestAnimationFrame(frame);
}
})();
</script></body></html>`;
}

export function ShaderBackground({ imageSource }: ShaderBackgroundProps) {
  const [html, setHtml] = useState<string | null>(null);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!imageSource) return;
    let cancelled = false;

    (async () => {
      try {
        let base64: string;

        if (typeof imageSource === 'object' && 'uri' in imageSource) {
          const response = await fetch(imageSource.uri);
          const blob = await response.blob();
          base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          const asset = Asset.fromModule(imageSource);
          await asset.downloadAsync();
          if (cancelled || !asset.localUri) return;
          const file = new ExpoFile(asset.localUri);
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const chunk = 8192;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(
              null,
              Array.from(bytes.subarray(i, Math.min(i + chunk, bytes.length))),
            );
          }
          base64 = btoa(binary);
        }

        if (!cancelled) {
          setHtml(buildHTML(base64));
          opacity.value = withTiming(1, {
            duration: 800,
            easing: Easing.out(Easing.ease),
          });
        }
      } catch (error) {
        console.error('Error loading image for shader:', error);
      }
    })();

    return () => { cancelled = true; };
  }, [imageSource]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.75,
  }));

  if (!html) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        allowsInlineMediaPlayback
        javaScriptEnabled
        originWhitelist={['*']}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
