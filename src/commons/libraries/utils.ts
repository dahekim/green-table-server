// 날짜 생성
export const getToday = () => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = date.getMonth() + 1
    const dd = date.getDate()

    return `${yyyy}/${mm}/${dd}`
}

export const oneMonthLater = () => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = date.getMonth() + 2
    const dd = date.getDate()

    return `${yyyy}/${mm}/${dd}`
}