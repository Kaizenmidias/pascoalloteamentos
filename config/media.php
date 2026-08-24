<?php

return [
    'upload_url' => rtrim((string) env('MEDIA_UPLOAD_URL', ''), '/'),
    'max_upload_kb' => (int) env('MEDIA_MAX_UPLOAD_KB', 524288),
    'gallery_upload_limit' => (int) env('MEDIA_GALLERY_UPLOAD_LIMIT', 50),
    'ffmpeg' => env('FFMPEG_PATH', '/usr/bin/ffmpeg'),
    'ffprobe' => env('FFPROBE_PATH', '/usr/bin/ffprobe'),
    'video_crf' => 23,
    'video_preset' => 'medium',
    'webp_quality' => 85,
];