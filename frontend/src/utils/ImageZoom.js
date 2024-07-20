import React, { useState } from "react";
import styled from "styled-components";

const ImageZoomContainer = styled.div`
  position: relative;
  width: 400px; /* Increased width */
  height: 500px; /* Increased height */
  border-radius: 12px;
  overflow: hidden;
  @media (max-width: 750px) {
    width: 100%;
    height: 600px;
  }
`;

const ZoomedImage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: black;
  background-image: url(${(props) => props.imgSrc});
  background-size: 200%;
  background-position: ${(props) => props.zoomX} ${(props) => props.zoomY};
  display: ${(props) => (props.isZoomed ? "block" : "none")};
  top: -5px; /* Move zoomed image 5px up */
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 0 0;
`;

const ImageZoom = ({ imgSrc }) => {
  const [zoomX, setZoomX] = useState("0%");
  const [zoomY, setZoomY] = useState("0%");
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const xPercent = (offsetX / rect.width) * 100;
    const yPercent = (offsetY / rect.height) * 100;

    setZoomX(`${xPercent}%`);
    setZoomY(`${yPercent}%`);
    setIsZoomed(true);
  };

  const handleMouseOut = () => {
    setIsZoomed(false);
  };

  return (
    <ImageZoomContainer
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseOut}
    >
      <ZoomedImage
        imgSrc={imgSrc}
        zoomX={zoomX}
        zoomY={zoomY}
        isZoomed={isZoomed}
      />
      <StyledImage src={imgSrc} alt="Zoomable Image" />
    </ImageZoomContainer>
  );
};

export default ImageZoom;
