// 날짜 생성
export const getToday = () => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = date.getMonth() + 1
    const dd = date.getDate()

    return `${yyyy}/${mm}/${dd}`
}

export const oneMonthLater = () => {
    return  new Date( new Date().getFullYear(), new Date().getMonth()+2, new Date().getDate())
}