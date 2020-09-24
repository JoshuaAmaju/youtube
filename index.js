const { style, Value, spring, timing, Easing } = Animated;

const value = new Value(0);

const container = query(".container");
const section = query("section", container);

const ul = query("ul", section);
const main = query("main", section);

const shim = query(".shim", main);
const frame = query(".frame", main);
const controls = query(".controls", main);

const down = query("img", shim);

const { width, height } = main.getBoundingClientRect();

const collapsedHeight = height / 4;
const targetDistance = innerHeight - collapsedHeight;
const fractionalDistance = targetDistance * 0.95;

const verticalRange = [0, targetDistance];
const horizontalRange = [fractionalDistance, innerHeight];

style(section, {
  transform: {
    translateY: {
      unit: "px",
      value: value.interpolate({
        inputRange: [0, fractionalDistance],
        outputRange: verticalRange,
      }),
    },
  },
});

style(main, {
  height: {
    unit: "px",
    value: value.interpolate({
      inputRange: verticalRange,
      outputRange: [height, collapsedHeight],
    }),
  },
});

style(frame, {
  flexBasis: {
    unit: "px",
    value: value.interpolate({
      inputRange: horizontalRange,
      outputRange: [width, width / 3],
    }),
  },
});

style(ul, {
  opacity: value.interpolate({
    inputRange: [0, targetDistance * 0.8],
    outputRange: [1, 0],
  }),
});

style(controls, {
  opacity: value.interpolate({
    inputRange: horizontalRange,
    outputRange: [0, 1],
  }),
});

let lastY = 0;
let animation;
let startY = 0;
let originalLastY = 0;
let pointerDown = false;
let direction = "unkwown";

value.subscribe(() => {
  lastY = value.value;
});

down.addEventListener("click", () => {
  animation = timing(value, {
    toValue: innerHeight,
    easing: Easing.easeInOutCubic,
  });

  shim.classList.add("hide");

  animation.start();
});

container.addEventListener("pointerdown", ({ clientY }) => {
  pointerDown = true;
  startY = clientY - lastY;
  if (animation) animation.stop();
});

container.addEventListener("pointermove", ({ clientY }) => {
  if (!pointerDown) return;
  if (pointerDown) shim.classList.add("hide");

  const sign = Math.sign(clientY - originalLastY);
  direction = sign === 0 ? "unkwown" : sign < 0 ? "up" : "down";
  value.next(clientY - startY);
  originalLastY = clientY;
});

container.addEventListener("pointerup", () => {
  originalLastY = 0;
  pointerDown = false;

  let target = 0;

  if (direction === "up") {
    target = 0;
  } else {
    target = innerHeight;
  }

  animation = timing(value, {
    toValue: target,
    easing: Easing.easeInOut,
  });

  animation.start(() => {
    if (direction === "up") {
      shim.classList.remove("hide");
    }
  });
});

function query(selector, parent = document) {
  return parent.querySelector(selector);
}
