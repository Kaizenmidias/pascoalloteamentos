<?php

namespace Tests\Unit;

use App\Services\Media\VideoMediaProcessor;
use Illuminate\Http\UploadedFile;
use RuntimeException;
use Tests\TestCase;

class VideoMediaProcessorTest extends TestCase
{
    public function test_it_limits_large_high_frame_rate_video_and_generates_poster(): void
    {
        $processor = new class extends VideoMediaProcessor
        {
            public array $commands = [];
            private int $probes = 0;

            protected function probe(string $path): array
            {
                $this->probes++;
                return $this->probes === 1
                    ? ['streams' => [['codec_type' => 'video', 'width' => 3840, 'height' => 2160, 'avg_frame_rate' => '60/1'], ['codec_type' => 'audio']]]
                    : ['streams' => [['codec_type' => 'video', 'width' => 1920, 'height' => 1080]], 'format' => ['duration' => '5.5']];
            }

            protected function run(array $command, string $message): void
            {
                $this->commands[] = $command;
                file_put_contents(end($command), 'processed');
            }
        };

        $result = $processor->process(UploadedFile::fake()->create('iphone.MOV', 10, 'video/quicktime'));

        $this->assertSame(1920, $result['width']);
        $this->assertContains('libx264', $processor->commands[0]);
        $this->assertContains('30', $processor->commands[0]);
        $this->assertContains('0:a?', $processor->commands[0]);
        $this->assertContains('+faststart', $processor->commands[0]);
        $this->assertContains('libwebp', $processor->commands[1]);
        $processor->cleanup($result);
    }

    public function test_it_rejects_a_file_without_video_stream(): void
    {
        $processor = new class extends VideoMediaProcessor
        {
            protected function probe(string $path): array
            {
                return ['streams' => [['codec_type' => 'audio']]];
            }
        };

        $this->expectException(RuntimeException::class);
        $processor->process(UploadedFile::fake()->create('fake.mov', 1, 'video/quicktime'));
    }
}
