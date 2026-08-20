<?php

namespace App\Services\Media;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\Process\Process;

class VideoMediaProcessor
{
    public function process(UploadedFile $file): array
    {
        if (! function_exists('proc_open')) {
            Log::error('Processamento de video indisponivel: proc_open esta desabilitado.', [
                'disabled_functions' => ini_get('disable_functions'),
                'ffmpeg' => config('media.ffmpeg'),
                'ffprobe' => config('media.ffprobe'),
            ]);

            throw new RuntimeException("N\u{00e3}o foi poss\u{00ed}vel processar o v\u{00ed}deo. O servi\u{00e7}o de processamento de m\u{00ed}dia n\u{00e3}o est\u{00e1} dispon\u{00ed}vel no servidor.");
        }

        $probe = $this->probe($file->getRealPath());
        $video = collect($probe['streams'] ?? [])->firstWhere('codec_type', 'video');
        if (! is_array($video)) {
            throw new RuntimeException('O arquivo enviado nao contem um stream de video valido.');
        }

        $output = $this->temporaryPath('mp4');
        $poster = $this->temporaryPath('webp');
        $fps = $this->frameRate((string) ($video['avg_frame_rate'] ?? $video['r_frame_rate'] ?? '0/1'));
        $filter = "scale=w='min(1920,iw)':h='min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2";

        try {
            $command = [
                config('media.ffmpeg', '/usr/bin/ffmpeg'), '-y', '-i', $file->getRealPath(),
                '-map', '0:v:0', '-map', '0:a?', '-vf', $filter,
            ];
            if ($fps > 30) {
                array_push($command, '-r', '30');
            }
            array_push(
                $command,
                '-c:v', 'libx264', '-preset', (string) config('media.video_preset', 'medium'),
                '-crf', (string) config('media.video_crf', 23), '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
                '-metadata:s:v:0', 'rotate=0', $output,
            );
            $this->run($command, 'Nao foi possivel converter o video para MP4.');
            $this->run([
                config('media.ffmpeg', '/usr/bin/ffmpeg'), '-y', '-ss', '0.5', '-i', $output,
                '-frames:v', '1', '-vf', "scale=w='min(1280,iw)':h=-2", '-c:v', 'libwebp', '-q:v', '80', $poster,
            ], 'O video foi convertido, mas nao foi possivel gerar sua capa.');

            $processedProbe = $this->probe($output);
            $processedVideo = collect($processedProbe['streams'] ?? [])->firstWhere('codec_type', 'video') ?: [];

            return [
                'video_path' => $output,
                'poster_path' => $poster,
                'width' => $processedVideo['width'] ?? null,
                'height' => $processedVideo['height'] ?? null,
                'duration' => isset($processedProbe['format']['duration']) ? (float) $processedProbe['format']['duration'] : null,
                'source' => $probe,
            ];
        } catch (\Throwable $error) {
            $this->remove($output);
            $this->remove($poster);
            throw $error;
        }
    }

    public function cleanup(array $processed): void
    {
        $this->remove($processed['video_path'] ?? null);
        $this->remove($processed['poster_path'] ?? null);
    }

    protected function probe(string $path): array
    {
        $process = new Process([
            config('media.ffprobe', '/usr/bin/ffprobe'), '-v', 'error', '-show_streams',
            '-show_format', '-of', 'json', $path,
        ]);
        $process->setTimeout(60)->run();
        if (! $process->isSuccessful()) {
            throw new RuntimeException('O arquivo enviado nao e um video valido: '.trim($process->getErrorOutput()));
        }

        $result = json_decode($process->getOutput(), true);
        if (! is_array($result)) {
            throw new RuntimeException('O ffprobe retornou dados invalidos para o video enviado.');
        }

        return $result;
    }

    protected function run(array $command, string $message): void
    {
        $process = new Process($command);
        $process->setTimeout(1800)->run();
        if (! $process->isSuccessful()) {
            throw new RuntimeException($message.' '.trim($process->getErrorOutput()));
        }
    }

    private function frameRate(string $rate): float
    {
        [$numerator, $denominator] = array_pad(array_map('floatval', explode('/', $rate, 2)), 2, 1.0);
        return $denominator > 0 ? $numerator / $denominator : 0;
    }

    private function temporaryPath(string $extension): string
    {
        $base = tempnam(sys_get_temp_dir(), 'pascoal-media-');
        if ($base === false) {
            throw new RuntimeException('Nao foi possivel criar um arquivo temporario para processar a midia.');
        }
        @unlink($base);
        return $base.'.'.$extension;
    }

    private function remove(?string $path): void
    {
        if ($path && is_file($path)) {
            @unlink($path);
        }
    }
}
