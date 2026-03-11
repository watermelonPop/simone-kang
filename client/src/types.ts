export interface Project {
    id: string
    name: string
    image: string
    desc: string
    demo_link: string
    github_link: string
    front_end: string[]
    back_end: string[]
    date: {
        month: number,
        year: number
    }
}

export interface WeatherInfo {
    temp_f: string
    cityName: string
    condition: string
    conditionIcon: string
}

export interface WeatherHour{
    time: string
    temp_f: string
    condition: string
    conditionIcon: string
    feels_like_f: string
}

export interface WeatherToday{
    date: string
    hours: WeatherHour[]
}

export interface WeatherDay{
    date: string
    hours: WeatherHour[]
    conditionIcon: string
    condition: string
    maxTemp: string
    minTemp: string
}

export interface Theme{
    name: string
    backgroundColor: string
    backgroundTxtColor: string 
    accentColor1: string
    accentTxtColor1: string
    accentColor2: string
    accentTxtColor2: string
    fontFamily: string
}