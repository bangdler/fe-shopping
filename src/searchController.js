
import {renderHistoryList, renderPrefixList} from "./headerRender.js";

export class SearchController {
    constructor(historyManager) {
        this.$searchBox = document.querySelector('.header__form__search')
        this.$prefixList = document.querySelector('.header__search__prefix-container')
        this.$historyList = document.querySelector('.header__search__history-container')
        this.$searchForm = document.querySelector('.header__form')
        this.timer = null
        this.prefixListDelayTime = 500
        this.prefixListState = false
        this.prefixListElements = []
        this.prefixListIndex = null
        this.keydownState = false
        this.originInputValue = null
        this.historyManager = historyManager
        this.historyState = true
    }

    initSearchController() {
        this.setSearchBoxEvent()
        this.setPrefixListEvent()
        this.setSearchFormEvent()
        this.setHistoryListEvent()
        this.onHistoryList()
    }

    setSearchBoxEvent() {
        this.$searchBox.addEventListener('keydown', (e) => this.searchKeydownHandler(e))
        this.$searchBox.addEventListener('click', (e) => this.searchClickHandler(e))
        this.$searchBox.addEventListener('focusout', (e) => this.searchFocusoutHandler(e))
        this.$searchBox.addEventListener('input', (e) => this.searchInputHandler(e))
    }

    setPrefixListEvent() {
        this.$prefixList.addEventListener('mouseover', (e) => this.prefixListMouseoverHandler(e))
    }

    setHistoryListEvent() {
        this.$historyList.addEventListener('click', (e) => this.historyListClickHandler(e))
        this.$historyList.addEventListener('mousedown', (e) => this.historyListMousedownHandler(e))
    }

    setSearchFormEvent() {
        this.$searchForm.addEventListener('submit', (e) => this.formSubmitHandler(e))
    }

    historyListClickHandler(e) {
        e.stopPropagation()

        this.toggleHistoryList(e)

        if(this.historyState) {
            this.deleteHistoryList(e)
            this.deleteAllHistoryList(e)
        }
    }

    historyListMousedownHandler(e) {
        e.preventDefault()
    }

    deleteHistoryList(e) {
        if(e.target.className !== 'history-delete') return
        const historyElem = e.target.closest('li')
        const historyWord = historyElem.firstElementChild.innerText
        this.historyManager.deleteItem(historyWord)
        this.onHistoryList()
    }

    deleteAllHistoryList(e) {
        if(e.target.className !== 'history-deleteAll') return
        this.historyManager.clearItem()
        this.onHistoryList()
    }

    toggleHistoryList(e) {
        if(e.target.className !== 'history-switch') return
        const $historySwitch = document.querySelector('.history-switch')

        if(this.historyState) {
            this.historyState = false
            $historySwitch.innerText = '최근검색어켜기'
            this.offHistoryList()
        }
        else {
            this.historyState = true
            $historySwitch.innerText = '최근검색어끄기'
            this.onHistoryList()
        }
    }

    historyListFocusoutHandler(e) {
        this.addVisibilityHidden(this.$historyList)
    }

    prefixListMouseoverHandler(e) {
        if(e.target.tagName === 'LI') {
            this.prefixListIndex = Number(e.target.dataset.index)
            this.removeKeyOn()
            this.addKeyOn(this.prefixListIndex)
        }
    }

    formSubmitHandler(e) {
        // submit 시 로컬스토리지에 반영하므로 새로고침
        //e.preventDefault() 로컬스토리지 반영 전

        if(!this.originInputValue || this.originInputValue.length === 0) return

        this.setOriginState()

        this.historyManager.addItem(this.originInputValue)
        this.historyState? this.onHistoryList() : this.offHistoryList()
    }

    searchKeydownHandler(e) {
        if(e.key === 'ArrowDown' || e.key === 'ArrowUp') { // 이부분으로 아래 문제 해결
            this.keydownState = true
        }
        if(e.isComposing) return
        // 아래 화살표를 처음 누를 때 인풋이 먼저 발생하면서 prefix 영역이 다시 나온다..keydownState 를 사전에 true 로 바꿔주면서 해결?
        if(e.key === 'ArrowDown' && this.prefixListState) {
            this.downPrefixList(e)
        }
        else if(e.key === 'ArrowUp' && this.prefixListState) {
            this.upPrefixList(e)
        }
        else {
            this.keydownState = false
        }
    }

    searchInputHandler(e) {
        if(this.keydownState) return

        const inputWord = e.target.value
        this.autoComplete(inputWord)
        if(inputWord.length === 0) {
            this.removeVisibilityHidden(this.$historyList)
        }
    }

    searchFocusoutHandler(e) {
        this.addVisibilityHidden(this.$prefixList)
        this.addVisibilityHidden(this.$historyList)

        if(e.target.value.length === 0) this.prefixListIndex = null
    }

    searchClickHandler(e){
        if(e.target.className === 'search-btn') return

        if(e.target.value.length === 0) return this.removeVisibilityHidden(this.$historyList)

        if(this.prefixListElements.length === 0) return
        this.removeVisibilityHidden(this.$prefixList)
    }

    onHistoryList() {
        const historyStorage = this.historyManager.getStorage()
        this.updateHistoryList([...historyStorage])
    }

    offHistoryList() {
        this.updateHistoryList('off')
    }

    updateHistoryList(historyList) {
        const $historyListOuter = document.querySelector('.history-list')
        renderHistoryList($historyListOuter, historyList)
    }

    setOriginState() {
        clearTimeout(this.timer)
        const $input = document.querySelector('.search-input')
        $input.value = ''
        this.addVisibilityHidden(this.$prefixList)
    }

    setPrefixListElements() {
        this.prefixListElements = [...this.$prefixList.children]
    }

    setBeforeKeydownState(e) {
        e.target.value = this.originInputValue
        this.keydownState = false
        this.prefixListIndex = null
        this.removeKeyOn()
    }

    autoComplete(inputWord) {
        this.originInputValue = inputWord
        this.addVisibilityHidden(this.$historyList)
        this.prefixListState = false
        this.prefixListIndex = null
        this.searchPrefixList(inputWord)
    }

    upPrefixList(e) {
        if(this.prefixListIndex === null) {
            this.prefixListIndex = this.prefixListElements.length
        }
        this.prefixListIndex -= 1
        if(this.prefixListIndex < 0) {
           return this.setBeforeKeydownState(e)
        }
        this.onKeyDownEffect(e, this.prefixListIndex)
    }

    downPrefixList(e) {
        if(this.prefixListIndex === null) {
            this.prefixListIndex = -1
        }
        this.prefixListIndex += 1
        if(this.prefixListIndex > this.prefixListElements.length - 1) {
            return this.setBeforeKeydownState(e)
        }
        this.onKeyDownEffect(e, this.prefixListIndex)
    }

    onKeyDownEffect(e, index) {
        this.removeKeyOn()
        this.addKeyOn(index)
        this.changeInputValue(e, index)
    }

    changeInputValue(e, index) {
        const targetElement = this.prefixListElements[index]
        e.target.value = targetElement.innerText
    }

    addKeyOn(index) {
        const targetElement = this.prefixListElements[index]
        targetElement.classList.add('key-on')
    }

    removeKeyOn() {
        this.prefixListElements.forEach(element => {
            if(element.classList.contains('key-on')){
                element.classList.remove('key-on')
            }
        })
    }

    addVisibilityHidden(target) {
        target.classList.add('visibility-hidden')
    }

    removeVisibilityHidden(target) {
        target.classList.remove('visibility-hidden')
    }

    searchPrefixList(word) {
        this.debounce(this.prefixListDelayTime)
            .then(() => this.fetchPrefixList(word))
            .then((prefixList) => this.openPrefixList(prefixList, word))
    }

    openPrefixList(prefixList, word) {
        prefixList.length === 0? this.addVisibilityHidden(this.$prefixList) : this.removeVisibilityHidden(this.$prefixList);
        const highlightPrefixList = this.getPrefixListForHighlight(prefixList, word)
        renderPrefixList(this.$prefixList, highlightPrefixList)
        this.setPrefixListElements()
        this.prefixListState = true
    }

    getPrefixListForHighlight(prefixList, word) {
        return prefixList.map(fullWord => fullWord.replace(word, `<strong>${word}</strong>`))
    }

    debounce(delayTime) {
        if(this.timer) {
            clearTimeout(this.timer)
        }
        return this.delay(delayTime)
    }

    delay(ms) {
        return new Promise((res) => {
            return this.timer = setTimeout(() => res(), ms);
        });
    }

    fetchPrefixList(word) {
        return fetch(`https://completion.amazon.com/api/2017/suggestions?session-id=133-4736477-7395454&customer-id=&request-id=4YM3EXKRH1QJB16MSJGT&page-type=Gateway&lop=en_US&site-variant=desktop&client-info=amazon-search-ui&mid=ATVPDKIKX0DER&alias=aps&b2b=0&fresh=0&ks=71&prefix=${word}&event=onKeyPress&limit=11&fb=1&suggestion-type=KEYWORD`)
            .then((res) => res.json())
            .then((prefixData) => prefixData.suggestions.map((v) => v.value))
    }
}
