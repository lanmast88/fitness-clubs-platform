import { useCallback, useRef } from "react";

/**
 * Горизонтальный слайдер со scroll-snap и зацикливанием.
 *
 * Шаг берётся из фактической ширины слайда, а не из константы: при
 * `snap-mandatory` прокрутка на произвольное расстояние откатывается
 * браузером к ближайшей точке привязки, и кнопка листает через раз.
 *
 * Долистав до края, следующий клик переносит к противоположному концу —
 * без клонирования слайдов, которое ломает snap и ключи React.
 */
export function useSnapSlider() {
  const trackRef = useRef(null);

  const slide = useCallback((direction) => {
    const track = trackRef.current;
    const firstSlide = track?.firstElementChild;
    if (!firstSlide) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    // Слайды помещаются целиком — листать нечего.
    if (maxScroll <= 1) return;

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = firstSlide.getBoundingClientRect().width + gap;

    // Последняя точка привязки обычно не совпадает с maxScroll: слайд шире
    // контейнера, и у конца остаётся несколько пикселей. Считаем, что мы на
    // последнем слайде, когда до конца меньше одного шага.
    const fitsWholeSlide = maxScroll >= step;
    const atEnd = maxScroll - track.scrollLeft < (fitsWholeSlide ? step : 1);
    const atStart = track.scrollLeft <= 1;
    const lastSnap = Math.floor(maxScroll / step) * step || maxScroll;

    let target;
    if (direction > 0 && atEnd) {
      target = 0;
    } else if (direction < 0 && atStart) {
      target = lastSnap;
    } else {
      target = Math.min(Math.max(track.scrollLeft + direction * step, 0), maxScroll);
    }

    track.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  return { trackRef, slide };
}
