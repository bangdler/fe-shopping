import { renderBannerBigImg } from "./renderBanner.js";

export class BannerController {
    constructor() {
        this.$smallImgContainer = document.querySelector('.banner__smallImg-container')
        this.$bigImgContainer = document.querySelector('.banner__bigImg-container')
        this.smallImgElements = [...this.$smallImgContainer.children]
        this.bigImgElements = [...this.$bigImgContainer.children]
        this.bannerIndex = 0
        this.bannerMaxIndex = this.smallImgElements.length
        this.intervalTime = 2000
        this.intervalTimer = null
        this.setTimer = null
        this.mouseoverDelayTime = 250
    }

    initBannerController() {
        this.changeBanner()
        this.setIntervalEvent()
        this.setSmallContainerEvent()
    }

    setSmallContainerEvent() {
        this.$smallImgContainer.addEventListener('mouseover', (e) => this.smallContainerMouseoverHandler(e))
        this.$smallImgContainer.addEventListener('mouseleave', (e) => this.smallContainerMouseleaveHandler(e))
    }

    setIntervalEvent() {
        this.intervalTimer = setInterval(this.autoChangeBanner.bind(this), this.intervalTime)
    }

    smallContainerMouseleaveHandler(e) {
        this.setIntervalEvent()
        clearTimeout(this.setTimer)
    }

    smallContainerMouseoverHandler(e) {
        if(!e.target.closest(".banner__smallImg-basicBorder")) return
        this.clearInterval()
        this.debounce(this.mouseoverDelayTime)
            .then(() => this.onMouseoverEffect(e))
    }

    onMouseoverEffect(e) {
        const $smallImg = e.target.closest(".banner__smallImg-basicBorder")
        const curIndex = Number($smallImg.dataset.index)
        this.bannerIndex = curIndex
        this.changeBanner()
    }

    changeBanner() {
        this.toggleSmallImgBlueBorder(this.smallImgElements[this.bannerIndex])
        this.toggleBigImg(this.bannerIndex)
    }

    autoChangeBanner() {
        this.bannerIndex += 1
        if(this.bannerIndex === this.bannerMaxIndex) this.bannerIndex = 0

        const targetElement = this.smallImgElements[this.bannerIndex]
        this.toggleSmallImgBlueBorder(targetElement)
        this.toggleBigImg(this.bannerIndex)
    }

    clearInterval() {
        if(this.intervalTimer) return clearInterval(this.intervalTimer)
    }

    toggleBigImg(index) {
        this.hiddenAllBigImg()
        this.unHiddenBigImg(index)
    }

    unHiddenBigImg(index) {
        const targetElement = this.bigImgElements[index]
        this.removeVisibilityHidden(targetElement)
    }

    hiddenAllBigImg() {
        this.bigImgElements.forEach((element) => this.addVisibilityHidden(element))
    }

    toggleSmallImgBlueBorder(target) {
        this.removeSmallImgBlueBorder()
        this.addSmallImgBlueBorder(target)
    }

    addSmallImgBlueBorder(target) {
        target.classList.add('banner__smallImg-blueBorder')
    }

    removeSmallImgBlueBorder() {
        this.smallImgElements.forEach(element => {
            if(element.classList.contains('banner__smallImg-blueBorder')){
                element.classList.remove('banner__smallImg-blueBorder')
            }
        })
    }

    addVisibilityHidden(target) {
        target.classList.add('visibility-hidden')
    }

    removeVisibilityHidden(target) {
        target.classList.remove('visibility-hidden')
    }

    debounce(delayTime) {
        if(this.setTimer) {
            clearTimeout(this.setTimer)
        }
        return this.delay(delayTime)
    }

    delay(ms) {
        return new Promise((res) => {
            return this.setTimer = setTimeout(() => res(), ms);
        });
    }
}