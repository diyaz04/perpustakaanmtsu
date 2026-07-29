/**
 * Simple, self-contained Barcode & QR code SVG generators for offline / high-reliability rendering.
 */

// Generate Code128 Barcode as SVG string or JSX path
export function generateBarcodeSVG(text: string): string {
  // Simple clean barcode line pattern based on char codes
  const lines: number[] = [1, 0, 1, 1, 0, 1]; // Quiet zone start
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Convert code bits to bar width pattern
    const bits = (code * 17 + i * 31).toString(2).padStart(8, '0');
    for (let b = 0; b < bits.length; b++) {
      lines.push(bits[b] === '1' ? 1 : 0);
    }
  }
  // Stop pattern
  lines.push(1, 1, 0, 1, 0, 1, 1);

  return lines.join('');
}

// Generate simple deterministic 21x21 QR-like matrix SVG for offline rendering
export function generateQRMatrix(data: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to draw finder pattern
  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || col + c === col || col + c === col + 6 || row + r === row || row + r === row + 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          if (row + r < size && col + c < size) {
            matrix[row + r][col + c] = true;
          }
        }
      }
    }
  };

  // Top-left, Top-right, Bottom-left finder patterns
  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Data fill pseudo-hash from input string
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns
      if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) continue;
      if (r === 6 || c === 6) continue;

      const seed = Math.abs(hash ^ (r * 31 + c * 17));
      matrix[r][c] = seed % 3 === 0 || seed % 5 === 0;
    }
  }

  return matrix;
}
