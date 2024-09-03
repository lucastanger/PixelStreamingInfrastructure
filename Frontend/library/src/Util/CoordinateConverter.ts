// Copyright Epic Games, Inc. All Rights Reserved.

export interface RectSize {
    width: number;
    height: number;
}

export interface NormalizedQuantizedUnsignedCoord {
    inRange: boolean;
    x: number;
    y: number;
}

export interface UnquantizedDenormalizedUnsignedCoord {
    x: number;
    y: number;
}

export interface NormalizedQuantizedSignedCoord {
    x: number;
    y: number;
}

/**
 * Converts coordinates from element relative coordinates to values normalized within the value range of a short (and back again)
 */
export class CoordinateConverter {
    playerSize: RectSize;
    ratio: number;
    playerIsLarger: boolean;

    setup(playerSize: RectSize, videoSize: RectSize) {
        const playerAspectRatio = playerSize.height / playerSize.width;
        const videoAspectRatio = videoSize.height / videoSize.width;
        this.playerIsLarger = playerAspectRatio > videoAspectRatio;
        this.playerSize = playerSize;
        this.ratio = this.playerIsLarger
            ? playerAspectRatio / videoAspectRatio
            : videoAspectRatio / playerAspectRatio;
    }

    normalizeAndQuantizeUnsigned(x: number, y: number): NormalizedQuantizedUnsignedCoord {
        const normalizedX = this.playerIsLarger
            ? x / this.playerSize.width
            : this.ratio * (x / this.playerSize.width - 0.5) + 0.5;
        const normalizedY = this.playerIsLarger
            ? this.ratio * (y / this.playerSize.height - 0.5) + 0.5
            : y / this.playerSize.height;
        if (normalizedX < 0.0 || normalizedX > 1.0 || normalizedY < 0.0 || normalizedY > 1.0) {
            return { inRange: false, x: 65535, y: 65535 };
        } else {
            return { inRange: true, x: normalizedX * 65536, y: normalizedY * 65536 };
        }
    }

    unquantizeAndDenormalizeUnsigned(x: number, y: number): UnquantizedDenormalizedUnsignedCoord {
        const normalizedX = this.playerIsLarger ? x / 65536 : (x / 65536 - 0.5) / this.ratio + 0.5;
        const normalizedY = this.playerIsLarger ? (y / 65536 - 0.5) / this.ratio + 0.5 : y / 65536;
        return { x: normalizedX * this.playerSize.width, y: normalizedY * this.playerSize.height };
    }

    normalizeAndQuantizeSigned(x: number, y: number): NormalizedQuantizedSignedCoord {
        const normalizedX = this.playerIsLarger
            ? x / (0.5 * this.playerSize.width)
            : (this.ratio * x) / (0.5 * this.playerSize.width);
        const normalizedY = this.playerIsLarger
            ? (this.ratio * y) / (0.5 * this.playerSize.height)
            : y / (0.5 * this.playerSize.height);
        return { x: normalizedX * 32767, y: normalizedY * 32767 };
    }
}
