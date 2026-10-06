import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { CvFile } from '../../models/cv-file';
import { formatFileSize } from './format-file-size';

let nextId = 0;

/**
 * CV picker: a real button opens the file dialog, and the same button is the drop target.
 * Only the file's name and size leave this component (Clarification Q1).
 */
@Component({
  selector: 'hf-cv-picker',
  imports: [Button],
  templateUrl: './cv-picker.html',
  styleUrl: './cv-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvPicker {
  readonly file = input<CvFile | null>(null);
  readonly error = input<string | null | undefined>(null);
  readonly disabled = input(false);
  readonly fileChosen = output<CvFile>();
  readonly removed = output<void>();

  readonly #injector = inject(Injector);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly dropzone = viewChild<ElementRef<HTMLButtonElement>>('dropzone');
  // `read: ElementRef`: the ref sits on a component host (hf-button), not a plain element.
  private readonly removeButton = viewChild('removeButton', {
    read: ElementRef<HTMLButtonElement>,
  });

  protected readonly labelId = `hf-cv-picker-${nextId++}`;
  protected readonly messageId = `${this.labelId}-message`;
  protected readonly dragging = signal(false);
  protected readonly sizeLabel = computed(() => {
    const file = this.file();
    return file ? formatFileSize(file.sizeBytes) : '';
  });
  protected readonly badge = computed(() => {
    const extension = this.file()?.fileName.split('.').pop()?.toUpperCase() ?? '';
    return ['PDF', 'DOC', 'DOCX'].includes(extension) ? extension : 'FILE';
  });

  protected browse(): void {
    if (!this.disabled()) {
      this.fileInput().nativeElement.click();
    }
  }

  protected onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.#take(target.files?.[0]);
    // Reset so choosing the same file again still fires `change`.
    target.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.dragging.set(true);
    }
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) {
      this.#take(event.dataTransfer?.files?.[0]);
    }
  }

  protected remove(): void {
    this.removed.emit();
    this.#focusAfterRender(() => this.dropzone());
  }

  #take(file: File | undefined): void {
    if (!file) {
      return;
    }
    this.fileChosen.emit({ fileName: file.name, sizeBytes: file.size });
    this.#focusAfterRender(() => this.removeButton());
  }

  /** Keeps keyboard focus in the picker when the dropzone and the chosen row swap. */
  #focusAfterRender(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.#injector });
  }
}
