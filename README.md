# Music Recommendation App

這是一個簡單的 Flask 應用，使用本地資料根據你喜歡的音樂風格推薦歌曲，不再連接 Spotify。

## Setup

1. 安裝依賴：
   ```
   pip install -r requirements.txt
   ```

## Running the App

運行應用：
```
python3 app.py
```

應用會在 `http://localhost:5001` 提供服務（macOS 上 5000 port 常被 AirPlay 佔用，所以改用 5001）。

## Usage

- 開啟瀏覽器 `http://localhost:5001`，從下拉選單選擇音樂風格。
- 也可以透過 API 呼叫（記得帶上 `Accept: application/json` header 才會回傳 JSON）：
  `http://localhost:5001/recommend?genre=pop`

回傳結果範例：
```json
{
  "genre": "pop",
  "recommendations": [
    {"name": "As It Was", "artist": "Harry Styles"},
    {"name": "Levitating", "artist": "Dua Lipa"}
  ]
}
```
