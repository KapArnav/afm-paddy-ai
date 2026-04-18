import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("WEATHER API HIT");

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "WEATHER_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const location = searchParams.get("location") || "Kedah";

    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      location
    )}&units=metric&appid=${apiKey}`;

    const res = await fetch(endpoint);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch weather data from OpenWeather API" },
        { status: res.status }
      );
    }

    const data = await res.json();

    let rain_probability = 0;
    if (data.rain) {
      rain_probability = 100;
    } else if (data.clouds && data.clouds.all !== undefined) {
      rain_probability = data.clouds.all;
    }

    return NextResponse.json({
      temperature: data.main?.temp ?? 0,
      humidity: data.main?.humidity ?? 0,
      rain_probability: rain_probability,
    });
  } catch (error: unknown) {
    console.error("weather error:", error);
    return NextResponse.json(
      { success: false, error: "Weather intelligence offline" },
      { status: 500 }
    );
  }
}
