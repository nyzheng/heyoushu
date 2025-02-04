(function () {

    const JSfn = () => {
        let autoRun = true; // 是否自動輪播
        let RunSlider = null;
        let timer = 3000; // 1000 = 1秒
        let active = 0;

        let ul = document.querySelector(".slider-container > ul");
        let lis = document.querySelectorAll(".slider-container > ul > li");
        if (lis.length <= 1) {
            return;
        }
        let dots = document.querySelectorAll(".slider-container > .dots_wrapper > .dot_navigation");

        let control_prev = document.querySelector(".slider-container > .control_prev");
        let control_next = document.querySelector(".slider-container > .control_next");

        let imgWidth = document.querySelector(".slider-container > ul > li").offsetWidth;

        const autoPlay = () => {
            if (autoRun) {
                clearInterval(RunSlider);
                RunSlider = setInterval(() => {
                    moveRight(++active);
                }, timer);
            }
        };

        ul.prepend(document.querySelector(".slider-container > ul > li:last-child")); // 加入開頭

        ul.style.cssText = `left: ${-imgWidth}px;`;

        const dotsShow = () => {
            for (let item of dots) {
                item.classList.remove("slider_active_dot");
            }

            dots[active].classList.add("slider_active_dot");
        };

        const moveLeft = async (index) => {
            active = (index + lis.length) % lis.length;

            clearInterval(RunSlider);

            ul.animate(
                [
                    { left: `-${imgWidth * 2}px` },
                    { left: `-${imgWidth}px` },
                ],
                {
                    duration: 800,
                    iterations: 1, // Infinity
                },
            );

            ul.prepend(document.querySelector(".slider-container > ul > li:last-child")); // 加入開頭

            dotsShow();
            autoPlay();
        };

        const moveRight = async (index) => {
            active = (index + lis.length) % lis.length;

            clearInterval(RunSlider);

            ul.animate(
                [
                    { left: "0px" },
                    { left: `${- (imgWidth)}px` }
                ],
                {
                    duration: 800,
                    iterations: 1, // Infinity
                },
            );

            ul.append(document.querySelector(".slider-container > ul > li:first-child")); // 加入結尾

            dotsShow();
            autoPlay();
        };

        control_prev.addEventListener("click", (event) => {
            event.preventDefault(); // 取消預設觸發行為
            event.stopPropagation(); // 終止冒泡事件

            moveLeft(--active);
        }, false);

        control_next.addEventListener("click", (event) => {
            event.preventDefault(); // 取消預設觸發行為
            event.stopPropagation(); // 終止冒泡事件

            moveRight(++active);
        }, false);

        document.addEventListener("visibilitychange", () => { // 切換、縮小頁面時
            if (document.hidden) clearInterval(RunSlider); else autoPlay();
        });

        document.querySelector(".slider-container").addEventListener("mouseover", (event) => {
            event.preventDefault(); // 取消預設觸發行為
            event.stopPropagation(); // 終止冒泡事件

            clearInterval(RunSlider);
        }, false);

        document.querySelector(".slider-container").addEventListener("mouseleave", (event) => {
            event.preventDefault(); // 取消預設觸發行為
            event.stopPropagation(); // 終止冒泡事件

            autoPlay();
        }, false);

        setTimeout(autoPlay, 2000); // 2秒後再開始輪播

        //小圓按鈕
        var dotElements = document.querySelectorAll('.dot_navigation');
        var eventIndex = 0;
        dotElements.forEach(function (dotElement) {
            var currentEventIndex = eventIndex;
            dotElement.addEventListener('click', function () {
                clickButtun(currentEventIndex);
            });
            eventIndex++;
        });
        var dotElements = document.querySelectorAll('.dot_navigation');

        const findActiveDot = () => {
            let activeIndex = -1;
            dotElements.forEach(function (dotElement, index) {
                if (dotElement.classList.contains('slider_active_dot')) {
                    activeIndex = index;
                }
            });
            return activeIndex
        }

        const clickButtun = (currentEventIndex) => {
            const activeDotIndex = findActiveDot();
            moveLoop(currentEventIndex, activeDotIndex);

        }
        const moveLoop = (currentEventIndex, activeDotIndex) => {
            if (currentEventIndex - activeDotIndex > 0) {
                moveRight(++active);
                activeDotIndex++;
            }
            if (currentEventIndex - activeDotIndex < 0) {
                moveLeft(--active);
                activeDotIndex--;
            }
            if (currentEventIndex - activeDotIndex == 0) {
                return
            }
            setTimeout(() => {
                moveLoop(currentEventIndex, activeDotIndex);
            }, 800);

        }
    };



    window.addEventListener("load", JSfn, false);

})()
