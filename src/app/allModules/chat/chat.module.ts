import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from './chat-widget/chat-widget.component';
import { ChatInputComponent } from './chat-input/chat-input.component';
// import { ChatConfigComponent } from './chat-config/chat-config.component'
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  imports: [CommonModule, MatIconModule, MatButtonModule,],
  declarations: [ChatWidgetComponent, ChatInputComponent],
  exports: [ChatWidgetComponent],
  entryComponents: [ChatWidgetComponent],
})
export class ChatModule { }
