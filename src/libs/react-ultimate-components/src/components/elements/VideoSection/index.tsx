"use client";

import Button from "../../buttons/button";
import Paragraph from "../../typography/Paragraph";
import Title from "../../typography/Title";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export interface VideoSectionProps {
  /** Largura da seção */
  size: "midle" | "full";
  /** Título principal */
  title?: string;
  /** Texto descritivo */
  description?: string;
  /** URL do vídeo de fundo */
  videoUrl: string;
  /** Poster exibido enquanto o vídeo carrega */
  posterUrl?: string;
  /** Exibir controles nativos do player */
  showPlayPauseButton?: boolean;
  /** Renderiza apenas o vídeo, sem conteúdo sobreposto */
  backgroundOnly?: boolean;
  /** Exibe o gradiente interno sobre o vídeo */
  showOverlay?: boolean;
  /** Título do botão primário */
  primaryButtonTitle?: string;
  /** Título do botão secundário */
  secondaryButtonTitle?: string;
  /** Callback do botão primário */
  onPrimaryClick?: () => void;
  /** Callback do botão secundário */
  onSecondaryClick?: () => void;
  /** Classe adicional do botão primário */
  primaryButtonClassName?: string;
  /** Classe adicional do botão secundário */
  secondaryButtonClassName?: string;
  /** Classe adicional do título */
  titleClassName?: string;
  /** Classe adicional da descrição */
  descriptionClassName?: string;
  /** Classe adicional do container */
  containerClassName?: string;
  /** Classe adicional da overlay */
  overlayClassName?: string;
  /** Classe adicional do vídeo */
  videoClassName?: string;
}

export default function VideoSection({
  size,
  title,
  description,
  videoUrl,
  posterUrl,
  showPlayPauseButton = false,
  backgroundOnly = false,
  showOverlay = true,
  primaryButtonTitle,
  secondaryButtonTitle,
  onPrimaryClick,
  onSecondaryClick,
  primaryButtonClassName,
  secondaryButtonClassName,
  titleClassName,
  descriptionClassName,
  containerClassName,
  overlayClassName,
  videoClassName,
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (!isPlaying) {
      videoElement.pause();
      return;
    }

    void videoElement.play().catch(() => {
      setIsPlaying(false);
    });
  }, [isPlaying]);

  return (
    <section
      className={clsx(size === "full" ? "w-full" : "w-full max-w-7xl mx-auto")}
    >
      <div
        className={clsx(
          "relative  overflow-hidden min-h-[300px] sm:min-h-[420px] lg:min-h-[540px] w-full",
          containerClassName,
        )}
      >
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={posterUrl}
            controls={showPlayPauseButton}
            className={clsx(
              "absolute inset-0 h-full w-full object-cover [transform:translateZ(0)]",
              showPlayPauseButton ? "pointer-events-auto" : "pointer-events-none",
              videoClassName,
            )}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>

        {showOverlay && (
          <div
            className={clsx(
              "absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/10 to-black/15",
              overlayClassName,
            )}
          />
        )}

        {showPlayPauseButton && (
          <button
            type="button"
            aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
            onClick={() => setIsPlaying((prev) => !prev)}
            className="absolute top-3 right-3 flex items-center justify-center sm:top-4 sm:right-4 z-20 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/65 text-secondary-900 hover:bg-white/85 transition"
          >
            {isPlaying ? (
              <PauseIcon size={18} weight="fill" className="mx-auto" />
            ) : (
              <PlayIcon size={18} weight="fill" className="mx-auto" />
            )}
          </button>
        )}

        {!backgroundOnly && (title || description) && (
          <div className="absolute left-4 right-4 bottom-24 z-20 max-w-[82%] sm:left-8 sm:right-8 sm:bottom-10 sm:max-w-[70%]">
            {title && (
              <Title
                content={title}
                element="h2"
                className={clsx(
                  "text-white text-3xl leading-[0.95] sm:text-5xl md:text-6xl",
                  titleClassName,
                )}
              />
            )}
            {description && (
              <Paragraph
                content={description}
                className={clsx(
                  "mt-3 text-sm text-white/90 sm:mt-4 sm:text-base md:text-lg",
                  descriptionClassName,
                )}
              />
            )}
          </div>
        )}

        {!backgroundOnly && (primaryButtonTitle || secondaryButtonTitle) && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap gap-2 sm:bottom-8 sm:left-auto sm:right-8 sm:justify-end sm:gap-3">
            {primaryButtonTitle && (
              <Button
                label={primaryButtonTitle}
                variant="filled"
                onClick={onPrimaryClick}
                className={clsx(
                  "rounded-full bg-white px-4 py-2 text-none hover:bg-white/85 sm:px-6 sm:py-3",
                  primaryButtonClassName,
                )}
              />
            )}
            {secondaryButtonTitle && (
            <Button
              label={secondaryButtonTitle}
              variant="outlined"
              onClick={onSecondaryClick}
              className={clsx(
                "rounded-full px-4 py-2 sm:px-6 sm:py-3 border-white text-white hover:bg-white/15",
                secondaryButtonClassName,
              )}
            />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
