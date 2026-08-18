<?php

return [
    'ffmpeg' => env('FFMPEG_PATH', '/usr/bin/ffmpeg'),
    'ffprobe' => env('FFPROBE_PATH', '/usr/bin/ffprobe'),
    'video_crf' => 23,
    'video_preset' => 'medium',
    'webp_quality' => 85,
];
