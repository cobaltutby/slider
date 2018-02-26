import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  sliderElem: HTMLElement;
  thumbElems: HTMLElement[];
  shiftX: number;
  sliderCoords: Coords;
  thumbCoords: Coords;

  activeElement = -1;

  intervals_count = 1;
  thumb_count = 6;

  thumbs: string[];

  min_value = 1;
  max_value = 100;

  min_interval = 1;


  intervals: Interval[];


  constructor() {

    this.intervals = [];

    setTimeout(() => {

      this.sliderElem = document.getElementById('slider');
      this.sliderCoords = this.getCoords(this.sliderElem);
      this.max_value = this.sliderElem.offsetWidth;

    }, 0);

    // this.updateSlider()

  }


  getElements(id: number) {

    return document.getElementById('thumb' + id);

  }

  getLine(id: number) {

    return document.getElementById('line' + id);

  }

  mouseDown(e: MouseEvent, thb_id: number) {

    this.activeElement = thb_id;
    this.thumbCoords = this.getCoords(this.getElements(thb_id));
    this.shiftX = e.pageX - this.thumbCoords.left;

    return false;

  };

  getActiveInterval(activeElement: number) {

    const interval_idx = (activeElement - activeElement % 2) / 2;

    return this.intervals[interval_idx]

  }


  getDisabledIntervals(): Interval[] {

    const disabled_intervals = [];
    this.intervals.forEach(interval => {
      if (interval.disabled) {
        disabled_intervals.push(interval);
      }
    });
    return disabled_intervals;
  }

  getDisabledLimit(interval: Interval) {


    const current_right_position = this.getCoords(this.getElements(interval.right_idx)).left;
    const current_left_position = this.getCoords(this.getElements(interval.left_idx)).left;


    const disabled_intervals = this.getDisabledIntervals();

    let current_right_limit = 999;
    let current_left_limit = -1;

    disabled_intervals.forEach(disabled_interval => {

      const disabled_interval_left_limit = this.getCoords(this.getElements(disabled_interval.left_idx)).left;
      const disabled_interval_right_limit = this.getCoords(this.getElements(disabled_interval.right_idx)).left;
      if (disabled_interval_left_limit > current_right_position && current_right_limit > disabled_interval_left_limit) {
        current_right_limit = disabled_interval_left_limit - this.sliderCoords.left;
      }

      if (disabled_interval_right_limit < current_left_position && current_left_limit < disabled_interval_right_limit) {
        current_left_limit = disabled_interval_right_limit - this.sliderCoords.left;
      }

    });


    return [current_left_limit, current_right_limit]

  }

  onmousemove(e: MouseEvent) {

    if (this.activeElement < 0) {
      return;
    }


    const interval = this.getActiveInterval(this.activeElement);

    const [current_left_limit, current_right_limit] = this.getDisabledLimit(interval);



    let thumb: HTMLElement;
    const line = this.getLine(interval.index);
    const isRight = this.activeElement === interval.right_idx;

    let left_thumb_idx = null;
    let right_thumb_idx = null;

    if (this.activeElement === interval.left_idx || this.activeElement === interval.right_idx) {
      left_thumb_idx = interval.left_idx;
      right_thumb_idx = interval.right_idx;
    }

    const left_limit = null;
    const right_limit = null;

    const left_thumb = this.getElements(left_thumb_idx);
    const left = this.getCoords(left_thumb).left;
    const right_thumb = this.getElements(right_thumb_idx);
    const right = this.getCoords(right_thumb).left;



    if (isRight) {
      thumb = right_thumb;
    } else {
      thumb = left_thumb;
    }

    let newLeft = e.pageX - this.shiftX - this.sliderCoords.left;



    if (newLeft < 0) {
      newLeft = 0;
    }

    if (isRight && newLeft < this.getCoords(left_thumb).left - this.sliderCoords.left + this.min_interval) {
      newLeft = this.getCoords(left_thumb).left - this.sliderCoords.left + this.min_interval
    }

    const rightEdge = this.sliderElem.offsetWidth - thumb.offsetWidth;

    if (newLeft > rightEdge) {
      newLeft = rightEdge;
    }

    if (!isRight && newLeft > (this.getCoords(right_thumb).left - this.sliderCoords.left - this.min_interval)) {

      newLeft = (this.getCoords(right_thumb).left - this.sliderCoords.left - this.min_interval);
    }

    thumb.style.background = interval.disabled ? 'grey' : 'blue';


    if (isRight && current_right_limit < 999 && newLeft > current_right_limit - 10) {
      newLeft = current_right_limit - 10;
      thumb.style.background = 'red';
    }

    if (!isRight && current_left_limit > -1 && newLeft < current_left_limit + 10) {
      newLeft = current_left_limit + 10;
      thumb.style.background = 'red';
    }

    const current_line_left = Number(line.style.left.split('px')[0])
    const current_line_width = Number(line.style.width.split('px')[0])

    if (isRight) {
      line.style.width = (newLeft - current_line_left) + 'px';
    } else {
      line.style.width = (current_line_width - (newLeft - current_line_left)) + 'px';
      line.style.left = newLeft + 'px';
    }

    thumb.style.left = newLeft + 'px';

  }

  onmouseup() {

    this.activeElement = -1;
    return false;
  }


  dragStart() {
    return false;
  }

  onmouseleave() {
    this.activeElement = -1;
  }


  getCoords(elem: HTMLElement) {


    const box = elem.getBoundingClientRect();

    return new Coords(
      Number(box.top + window.pageYOffset),
      Number(box.left + window.pageXOffset)
    );

  }


  addInterval(disabled: boolean) {

    const new_interval = new Interval;
    new_interval.disabled = disabled;
    new_interval.left_idx = 2 * this.intervals.length;
    new_interval.right_idx = new_interval.left_idx + 1;
    new_interval.index = this.intervals.length;
    new_interval.color = disabled ? 'grey' : 'blue';

    this.intervals.push(new_interval);
    this.setDefaultColors(new_interval);

  }

  setDefaultColors(interval: Interval) {

    setTimeout(() => {
      const thumb1 = this.getElements(interval.left_idx);
      const thumb2 = this.getElements(interval.right_idx);
      const line = this.getLine(interval.index);

      thumb1.style.background = interval.color;
      thumb2.style.background = interval.color;
      line.style.background = interval.color;
    }, 0)


  }



}


export class Coords {
  top: number;
  left: number;

  constructor(top: number, left: number) {
    this.top = top;
    this.left = left;
  }
}

export class Interval {
  index: number;
  disabled: boolean;
  left_idx: number;
  right_idx: number;
  color: string;

  constructor(disabled?: boolean, left_idx?: number, right_idx?: number, color?: string) {
    this.disabled = disabled;
    this.left_idx = left_idx;
    this.right_idx = right_idx;
    this.color = color;
  }
}
